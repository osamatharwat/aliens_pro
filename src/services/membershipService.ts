import { supabase } from '../lib/supabase';
import { AccessCodeItem, CommitteeKey, CommitteePosition, Profile, UserRole } from '../types';
import { auditService } from './auditService';

export const membershipService = {
  /**
   * Redeem a committee access code to activate team membership
   */
  async redeemAccessCode(codeStr: string, currentUser: Profile): Promise<Profile> {
    if (!currentUser || !currentUser.id) {
      throw new Error('يرجى تسجيل الدخول أولاً لتفعيل كود الترقية.');
    }

    const cleanCode = codeStr.trim().toUpperCase();
    if (!cleanCode) {
      throw new Error('يرجى إدخال كود الترقية.');
    }

    // 1. First attempt server-side RPC if provisioned
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('redeem_access_code', {
        p_code: cleanCode
      });
      if (!rpcError && rpcData) {
        // Refetch profile to get resolved role
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        if (updatedProfile) return updatedProfile as Profile;
      }
    } catch (rpcErr) {
      console.warn('RPC redemption skipped, continuing with database transaction flow:', rpcErr);
    }

    // 2. Query access_codes table
    const { data: codeRow, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (codeError || !codeRow) {
      throw new Error('كود الترقية غير صحيح أو غير موجود.');
    }

    if (codeRow.is_active === false) {
      throw new Error('عفواً، تم إيقاف تفعيل هذا الكود.');
    }

    if (codeRow.max_uses && (codeRow.current_uses || 0) >= codeRow.max_uses) {
      throw new Error('عفواً، تم استنفاذ الحد الأقصى لاستخدام هذا الكود.');
    }

    if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
      throw new Error('عفواً، انتهت صلاحية هذا الكود.');
    }

    // 3. Check for duplicate redemption by this user
    const { data: existingRedemption } = await supabase
      .from('access_code_redemptions')
      .select('id')
      .eq('code_id', codeRow.id)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (existingRedemption) {
      throw new Error('لقد قمت باستخدام هذا الكود مسبقاً.');
    }

    // 4. Record redemption
    await supabase
      .from('access_code_redemptions')
      .insert([{
        code_id: codeRow.id,
        user_id: currentUser.id,
        redeemed_at: new Date().toISOString()
      }]);

    // 5. Atomically increment current_uses
    await supabase
      .from('access_codes')
      .update({
        current_uses: (codeRow.current_uses || 0) + 1,
        is_active: (codeRow.current_uses || 0) + 1 < (codeRow.max_uses || 999999)
      })
      .eq('id', codeRow.id);

    // 6. Resolve new role and committee attributes from the code specification
    const targetRole: UserRole = (codeRow.target_role || 'member') as UserRole;
    const targetCommittee: CommitteeKey | undefined = 
      (codeRow.committee_key && codeRow.committee_key !== 'none') ? (codeRow.committee_key as CommitteeKey) : undefined;
    const targetPosition: CommitteePosition = 
      (codeRow.committee_position || (targetRole === 'head' ? 'Head' : targetRole === 'sub_head' ? 'Sub Head' : 'Member')) as CommitteePosition;
    
    const isEvaluator = targetRole === 'ir_evaluator' || targetRole === 'ir_head' || targetRole === 'ir_sub_head' || codeRow.is_evaluator === true;

    // 7. Update profile record in Supabase
    const { data: updatedProfile, error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        role: targetRole,
        committee_key: targetCommittee,
        committee_position: targetPosition,
        is_evaluator: isEvaluator,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id)
      .select()
      .single();

    if (profileUpdateError || !updatedProfile) {
      throw new Error('فشل تحديث رتبة الحساب في قاعدة البيانات.');
    }

    // 8. Log audit trail
    await auditService.logAction({
      actor_name: currentUser.full_name,
      actor_role: currentUser.role,
      actor_id: currentUser.id,
      action: 'REDEEM_ACCESS_CODE',
      entity_type: 'access_codes',
      entity_id: String(codeRow.id),
      details: `استخدم الكود ${cleanCode} وترقى إلى ${targetRole} في لجنة ${targetCommittee || 'العامة'}`
    });

    return {
      id: updatedProfile.id,
      user_id: updatedProfile.id,
      username: updatedProfile.username,
      full_name: updatedProfile.full_name,
      email: updatedProfile.email,
      role: updatedProfile.role as UserRole,
      committee_key: updatedProfile.committee_key,
      committee_position: updatedProfile.committee_position,
      avatar_url: updatedProfile.avatar_url,
      phone: updatedProfile.phone,
      student_id: updatedProfile.student_id,
      assigned_ir: updatedProfile.assigned_ir,
      is_evaluator: Boolean(updatedProfile.is_evaluator),
      created_at: updatedProfile.created_at
    };
  },

  /**
   * Get all access codes (for authorized leadership)
   */
  async getAccessCodes(): Promise<AccessCodeItem[]> {
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('getAccessCodes error:', error);
        return [];
      }

      return (data || []).map(row => ({
        id: String(row.id),
        code: row.code,
        target_role: row.target_role || row.role || 'member',
        committee_key: row.committee_key || row.committee || 'none',
        committee_position: row.committee_position || 'Member',
        max_uses: row.max_uses || 1,
        current_uses: row.current_uses || 0,
        is_active: Boolean(row.is_active),
        expires_at: row.expires_at,
        created_by: row.created_by,
        created_at: row.created_at
      }));
    } catch (e) {
      console.warn('getAccessCodes exception:', e);
      return [];
    }
  },

  /**
   * Create a new access code (Authorized leadership only)
   */
  async createAccessCode(codeData: Partial<AccessCodeItem>, actor: Profile): Promise<AccessCodeItem> {
    const cleanCode = (codeData.code || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('يرجى تحديد كود الترقية.');

    const newRow = {
      code: cleanCode,
      target_role: codeData.target_role || 'member',
      committee_key: codeData.committee_key || 'none',
      committee_position: codeData.committee_position || 'Member',
      max_uses: codeData.max_uses || 1,
      current_uses: 0,
      is_active: true,
      expires_at: codeData.expires_at || null,
      created_by: actor.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('access_codes')
      .insert([newRow])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل إنشاء كود الترقية.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'CREATE_ACCESS_CODE',
      entity_type: 'access_codes',
      entity_id: String(data.id),
      details: `أنشأ كود الترقية ${cleanCode} لرتبة ${data.target_role}`
    });

    return {
      id: String(data.id),
      code: data.code,
      target_role: data.target_role,
      committee_key: data.committee_key,
      committee_position: data.committee_position,
      max_uses: data.max_uses,
      current_uses: data.current_uses,
      is_active: data.is_active,
      expires_at: data.expires_at,
      created_by: data.created_by,
      created_at: data.created_at
    };
  },

  /**
   * Toggle code active state
   */
  async toggleAccessCode(id: string, isActive: boolean, actor: Profile): Promise<void> {
    const { error } = await supabase
      .from('access_codes')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'فشل تحديث حالة الكود.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'TOGGLE_ACCESS_CODE',
      entity_type: 'access_codes',
      entity_id: id,
      details: `تم ${isActive ? 'تفعيل' : 'إيقاف'} الكود`
    });
  }
};
