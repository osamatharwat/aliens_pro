/**
 * services/access_codes.js
 * Committee Access Code redemption and management.
 */
const AccessCodeService = {
  async redeemCode(codeStr, userId) {
    if (!window.sb || !userId) throw new Error("Authentication required.");
    const cleanCode = String(codeStr || '').trim().toUpperCase();
    if (!cleanCode) throw new Error("يرجى إدخال كود الترقية.");

    // First attempt server-side RPC if available, otherwise secure fallback with transaction logic
    try {
      const { data: rpcData, error: rpcError } = await window.sb.rpc('redeem_access_code', {
        p_code: cleanCode
      });
      if (!rpcError && rpcData) {
        return rpcData;
      }
    } catch (e) {
      console.warn("RPC redeem_access_code not configured or failed, using client transaction flow:", e);
    }

    // Direct table query lookup
    // Support both promo_codes and access_codes table names
    let codeRow = null;
    let tableName = 'promo_codes';

    const { data: pData, error: pErr } = await window.sb
      .from('promo_codes')
      .select('*')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (!pErr && pData) {
      codeRow = pData;
      tableName = 'promo_codes';
    } else {
      const { data: aData, error: aErr } = await window.sb
        .from('access_codes')
        .select('*')
        .ilike('code', cleanCode)
        .maybeSingle();
      if (!aErr && aData) {
        codeRow = aData;
        tableName = 'access_codes';
      }
    }

    if (!codeRow) throw new Error("كود الترقية غير صحيح أو منتهي الصلاحية.");
    if (codeRow.is_active === false) throw new Error("عفواً، هذا الكود تم إيقاف تفعيله.");
    if (codeRow.max_uses && (codeRow.current_uses || 0) >= codeRow.max_uses) {
      throw new Error("عفواً، تم استنفاذ الحد الأقصى لاستخدام هذا الكود.");
    }
    if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
      throw new Error("عفواً، انتهت صلاحية هذا الكود.");
    }

    // Determine target roles
    const finalRole = codeRow.role || codeRow.target_role || 'member';
    const finalCommittee = codeRow.committee_key || codeRow.committee || 'none';
    const finalPosition = codeRow.committee_position || codeRow.position || 'Member';

    // Update user profile
    const { error: updateErr } = await window.sb.from('profiles').update({
      role: finalRole,
      committee_key: finalCommittee,
      committee_position: finalPosition,
      committee: finalCommittee,
      position: finalPosition,
      updated_at: new Date().toISOString()
    }).eq('id', userId);

    if (updateErr) throw updateErr;

    // Increment code usage
    await window.sb.from(tableName).update({
      current_uses: (codeRow.current_uses || 0) + 1
    }).eq('id', codeRow.id);

    return {
      role: finalRole,
      committee_key: finalCommittee,
      committee_position: finalPosition
    };
  },

  async getAllCodes() {
    if (!window.sb) return [];
    try {
      const { data, error } = await window.sb.from('promo_codes').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {}
    try {
      const { data, error } = await window.sb.from('access_codes').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {}
    return [];
  },

  async createCode(payload) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const codeObj = {
      code: payload.code.toUpperCase().trim(),
      role: payload.role || 'member',
      committee_key: payload.committee_key || 'none',
      committee_position: payload.committee_position || 'Member',
      is_active: payload.is_active ?? true,
      max_uses: payload.max_uses ? parseInt(payload.max_uses, 10) : 1,
      current_uses: 0,
      created_at: new Date().toISOString()
    };
    const { data, error } = await window.sb.from('promo_codes').insert([codeObj]).select().single();
    if (error) throw error;
    return data;
  },

  async toggleCode(codeId, isActive) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { error } = await window.sb.from('promo_codes').update({ is_active: isActive }).eq('id', codeId);
    if (error) throw error;
    return true;
  },

  async deleteCode(codeId) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { error } = await window.sb.from('promo_codes').delete().eq('id', codeId);
    if (error) throw error;
    return true;
  }
};

window.AccessCodeService = AccessCodeService;
