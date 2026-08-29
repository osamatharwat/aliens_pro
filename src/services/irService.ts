import { supabase } from '../lib/supabase';
import { ApplicationItem, CommitteeKey, IRAssignment, Profile } from '../types';
import { profileService } from './profileService';
import { auditService } from './auditService';
import { applicationService } from './applicationService';

export interface EvaluatorWithLoad extends Profile {
  current_load: number;
  remaining_capacity: number;
  assigned_members: IRAssignment[];
}

export const irService = {
  MAX_LOAD_PER_EVALUATOR: 30,

  /**
   * Get all evaluators eligible to evaluate members/applicants
   */
  async getEligibleEvaluators(): Promise<EvaluatorWithLoad[]> {
    const profiles = await profileService.getAllProfiles();
    const assignments = await this.getActiveAssignments();

    const evaluators = profiles.filter(p => 
      p.is_evaluator === true ||
      ['ir_head', 'ir_sub_head', 'ir_evaluator', 'OG', 'team_head', 'team_sub_head'].includes(p.role) ||
      p.committee_key === 'ir'
    );

    return evaluators.map(ev => {
      const activeAssigned = assignments.filter(a => a.evaluator_id === ev.id && a.status === 'active');
      const load = activeAssigned.length;
      return {
        ...ev,
        current_load: load,
        remaining_capacity: Math.max(0, this.MAX_LOAD_PER_EVALUATOR - load),
        assigned_members: activeAssigned
      };
    });
  },

  /**
   * Get active member assignments from ir_assignments
   */
  async getActiveAssignments(): Promise<IRAssignment[]> {
    const { data, error } = await supabase
      .from('ir_assignments')
      .select('*')
      .eq('status', 'active')
      .order('assigned_at', { ascending: false });

    if (error) {
      console.warn('getActiveAssignments database error:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    const profiles = await profileService.getAllProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return data.map(row => {
      const evaluator = profileMap.get(row.evaluator_id);
      const member = profileMap.get(row.member_id);
      return {
        id: String(row.id),
        evaluator_id: row.evaluator_id,
        evaluator_name: evaluator ? evaluator.full_name : row.evaluator_name || 'مقيّم غير معروف',
        member_id: row.member_id,
        member_name: member ? member.full_name : row.member_name || 'عضو غير معروف',
        member_committee: member?.committee_key || row.member_committee,
        assigned_by: row.assigned_by,
        status: row.status as any,
        assigned_at: row.assigned_at
      };
    });
  },

  /**
   * Get full assignment history
   */
  async getAssignmentHistory(): Promise<IRAssignment[]> {
    const { data, error } = await supabase
      .from('ir_assignments')
      .select('*')
      .order('assigned_at', { ascending: false });

    if (error) {
      console.warn('getAssignmentHistory database error:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    const profiles = await profileService.getAllProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return data.map(row => {
      const evaluator = profileMap.get(row.evaluator_id);
      const member = profileMap.get(row.member_id);
      return {
        id: String(row.id),
        evaluator_id: row.evaluator_id,
        evaluator_name: evaluator ? evaluator.full_name : row.evaluator_name || 'مقيّم',
        member_id: row.member_id,
        member_name: member ? member.full_name : row.member_name || 'عضو',
        member_committee: member?.committee_key || row.member_committee,
        assigned_by: row.assigned_by,
        status: row.status as any,
        assigned_at: row.assigned_at
      };
    });
  },

  /**
   * Get unassigned active team members
   */
  async getUnassignedMembers(): Promise<Profile[]> {
    const all = await profileService.getAllProfiles();
    return all.filter(p => 
      p.role !== 'registered_user' && 
      p.role !== 'guest' && 
      !p.assigned_ir
    );
  },

  /**
   * Assign a current team member to an IR evaluator
   */
  async assignMember(memberId: string, evaluatorId: string, actor: Profile): Promise<IRAssignment> {
    const evaluators = await this.getEligibleEvaluators();
    const evaluator = evaluators.find(e => e.id === evaluatorId);
    if (!evaluator) {
      throw new Error('المقيّم غير موجود أو غير مؤهل.');
    }

    if (evaluator.current_load >= this.MAX_LOAD_PER_EVALUATOR) {
      throw new Error(`عفواً، وصل المقيّم ${evaluator.full_name} إلى الحد الأقصى لسعة التقييم (${this.MAX_LOAD_PER_EVALUATOR} عضو).`);
    }

    const member = (await profileService.getAllProfiles()).find(p => p.id === memberId);
    if (!member) {
      throw new Error('العضو غير موجود.');
    }

    // 1. Mark previous active assignments for this member as reassigned
    await supabase
      .from('ir_assignments')
      .update({ status: 'reassigned' })
      .eq('member_id', memberId)
      .eq('status', 'active');

    // 2. Insert new active assignment with schema-compatible payload
    const assignmentPayload = {
      evaluator_id: evaluatorId,
      member_id: memberId,
      assigned_by: actor.id,
      status: 'active',
      assigned_at: new Date().toISOString()
    };

    const { data: inserted, error: insertError } = await supabase
      .from('ir_assignments')
      .insert([assignmentPayload])
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message || 'فشل تسجيل التعيين في قاعدة البيانات.');
    }

    // 3. Update member profile's assigned_ir field
    const { error: profError } = await supabase
      .from('profiles')
      .update({ assigned_ir: evaluatorId, updated_at: new Date().toISOString() })
      .eq('id', memberId);

    if (profError) {
      console.warn('Profile assigned_ir update warning:', profError);
    }

    // 4. Audit Log
    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'ASSIGN_IR_MEMBER',
      entity_type: 'ir_assignments',
      entity_id: String(inserted?.id || memberId),
      details: `تم تعيين العضو ${member.full_name} إلى المقيّم ${evaluator.full_name}`
    });

    return {
      id: String(inserted.id),
      evaluator_id: evaluatorId,
      evaluator_name: evaluator.full_name,
      member_id: memberId,
      member_name: member.full_name,
      member_committee: member.committee_key,
      assigned_by: actor.id,
      status: 'active',
      assigned_at: inserted.assigned_at || new Date().toISOString()
    };
  },

  /**
   * Unassign a team member from IR evaluator
   */
  async unassignMember(memberId: string, actor: Profile): Promise<void> {
    const { error: asgnError } = await supabase
      .from('ir_assignments')
      .update({ status: 'completed' })
      .eq('member_id', memberId)
      .eq('status', 'active');

    if (asgnError) {
      throw new Error(asgnError.message || 'فشل إنهاء التعيين في جدول التكليفات.');
    }

    const { error: profError } = await supabase
      .from('profiles')
      .update({ assigned_ir: null, updated_at: new Date().toISOString() })
      .eq('id', memberId);

    if (profError) {
      throw new Error(profError.message || 'فشل تحديث ملف العضو.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UNASSIGN_IR_MEMBER',
      entity_type: 'ir_assignments',
      entity_id: memberId,
      details: `تم إلغاء تعيين العضو من المقيّم`
    });
  },

  /**
   * Reassign a member to a different evaluator
   */
  async reassignMember(memberId: string, newEvaluatorId: string, actor: Profile): Promise<IRAssignment> {
    return this.assignMember(memberId, newEvaluatorId, actor);
  },

  // =========================================================================
  // WORKFLOW B: NEW RECRUITMENT APPLICANTS
  // =========================================================================

  /**
   * Get all applicants distribution for IR management
   */
  async getApplicantDistribution(): Promise<ApplicationItem[]> {
    return applicationService.getApplications();
  },

  /**
   * Assign an applicant to an IR evaluator for interview
   */
  async assignApplicant(appId: string, evaluatorId: string, actor: Profile): Promise<void> {
    const evaluators = await this.getEligibleEvaluators();
    const evaluator = evaluators.find(e => e.id === evaluatorId);
    if (!evaluator) throw new Error('المقيّم غير موجود.');

    const { error } = await supabase
      .from('applications')
      .update({
        ir_assignee_id: evaluatorId,
        status: 'in_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', appId);

    if (error) {
      throw new Error(error.message || 'فشل تعيين المتقدم للمقيّم.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'ASSIGN_APPLICANT_IR',
      entity_type: 'applications',
      entity_id: appId,
      details: `تعيين المتقدم للمقابلة مع المقيّم ${evaluator.full_name}`
    });
  },

  /**
   * Unassign an applicant from IR evaluator
   */
  async unassignApplicant(appId: string, actor: Profile): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .update({
        ir_assignee_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', appId);

    if (error) {
      throw new Error(error.message || 'فشل إلغاء تعيين المتقدم.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UNASSIGN_APPLICANT_IR',
      entity_type: 'applications',
      entity_id: appId,
      details: `إلغاء تعيين المتقدم للمقابلة`
    });
  },

  /**
   * Submit interview notes and IR review decision for applicant
   */
  async submitApplicantReview(
    appId: string,
    review: {
      ir_status: 'pending' | 'accepted' | 'rejected' | 'shift_recommended';
      ir_notes?: string;
      shift_to_committee?: CommitteeKey;
    },
    actor: Profile
  ): Promise<void> {
    if (review.ir_status === 'shift_recommended' && review.shift_to_committee) {
      await applicationService.shiftApplicant(
        appId,
        review.shift_to_committee,
        review.ir_notes || 'توصية لجنة العلاقات الداخلية بتحويل التخصص',
        actor
      );
    }

    const finalStatus = review.ir_status === 'accepted' ? 'accepted' : review.ir_status === 'rejected' ? 'rejected' : 'in_review';

    const { error } = await supabase
      .from('applications')
      .update({
        ir_status: review.ir_status === 'shift_recommended' ? 'pending' : review.ir_status,
        ir_notes: review.ir_notes,
        status: finalStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', appId);

    if (error) {
      throw new Error(error.message || 'فشل تسجيل قرار المقابلة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'SUBMIT_IR_INTERVIEW_REVIEW',
      entity_type: 'applications',
      entity_id: appId,
      details: `قرار المقابلة: ${review.ir_status}. ملاحظات: ${review.ir_notes || 'لا توجد'}`
    });
  }
};
