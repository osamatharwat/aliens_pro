import { supabase } from '../lib/supabase';
import { ApplicationItem, CommitteeKey, Profile } from '../types';
import { auditService } from './auditService';

export const applicationService = {
  /**
   * Fetch applications with optional filtering
   */
  async getApplications(filters?: { committee_key?: string; status?: string; ir_assignee_id?: string }): Promise<ApplicationItem[]> {
    try {
      let query = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.committee_key && filters.committee_key !== 'all') {
        query = query.eq('committee_key', filters.committee_key);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.ir_assignee_id) {
        query = query.eq('ir_assignee_id', filters.ir_assignee_id);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('getApplications error:', error);
        return [];
      }

      return (data || []).map(row => ({
        id: String(row.id),
        applicant_name: row.applicant_name,
        phone: row.phone,
        email: row.email || '',
        faculty_level: row.faculty_level,
        committee_key: row.committee_key as CommitteeKey,
        committee_name: row.committee_name || row.committee_key,
        dynamic_answers: typeof row.dynamic_answers === 'object' ? row.dynamic_answers : JSON.parse(row.dynamic_answers || '{}'),
        question_snapshots: row.question_snapshots ? (typeof row.question_snapshots === 'object' ? row.question_snapshots : JSON.parse(row.question_snapshots)) : [],
        status: row.status || 'new',
        ir_status: row.ir_status || 'pending',
        ir_assignee_id: row.ir_assignee_id || undefined,
        ir_notes: row.ir_notes || undefined,
        committee_decision: row.committee_decision || 'pending',
        committee_notes: row.committee_notes || undefined,
        shift_history: row.shift_history ? (typeof row.shift_history === 'object' ? row.shift_history : JSON.parse(row.shift_history)) : [],
        created_at: row.created_at,
        updated_at: row.updated_at || row.created_at
      }));
    } catch (e) {
      console.warn('getApplications exception:', e);
      return [];
    }
  },

  /**
   * Submit new recruitment application
   */
  async submitApplication(appData: Partial<ApplicationItem>): Promise<ApplicationItem> {
    const payload = {
      applicant_name: appData.applicant_name?.trim(),
      phone: appData.phone?.trim(),
      email: appData.email?.trim() || null,
      faculty_level: appData.faculty_level,
      committee_key: appData.committee_key,
      committee_name: appData.committee_name || appData.committee_key,
      dynamic_answers: appData.dynamic_answers || {},
      question_snapshots: appData.question_snapshots || [],
      status: 'new',
      ir_status: 'pending',
      committee_decision: 'pending',
      shift_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('applications')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل تقديم طلب الانضمام.');
    }

    return {
      id: String(data.id),
      applicant_name: data.applicant_name,
      phone: data.phone,
      email: data.email,
      faculty_level: data.faculty_level,
      committee_key: data.committee_key,
      committee_name: data.committee_name,
      dynamic_answers: data.dynamic_answers,
      question_snapshots: data.question_snapshots,
      status: data.status,
      ir_status: data.ir_status,
      committee_decision: data.committee_decision,
      shift_history: data.shift_history || [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  /**
   * Update overall or committee application status
   */
  async updateApplicationStatus(id: string, status: 'new' | 'in_review' | 'accepted' | 'rejected' | 'shifted', actor: Profile, committeeNotes?: string): Promise<void> {
    const updates: any = {
      status,
      committee_decision: status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'pending',
      updated_at: new Date().toISOString()
    };
    if (committeeNotes !== undefined) updates.committee_notes = committeeNotes;

    const { error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'فشل تحديث حالة الطلب.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UPDATE_APPLICATION_STATUS',
      entity_type: 'applications',
      entity_id: id,
      details: `تحديث حالة طلب المتقدم إلى ${status}`
    });
  },

  /**
   * Shift applicant to another committee
   */
  async shiftApplicant(id: string, targetCommitteeKey: CommitteeKey, reason: string, actor: Profile): Promise<void> {
    const { data: existingApp, error: fetchErr } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existingApp) {
      throw new Error('الطلب غير موجود.');
    }

    const currentShiftHistory = existingApp.shift_history ? 
      (typeof existingApp.shift_history === 'object' ? existingApp.shift_history : JSON.parse(existingApp.shift_history)) : [];

    const newShiftEntry = {
      from_committee: existingApp.committee_key,
      to_committee: targetCommitteeKey,
      shifted_by: actor.full_name,
      shifted_at: new Date().toISOString(),
      reason: reason.trim()
    };

    const { error: updateErr } = await supabase
      .from('applications')
      .update({
        committee_key: targetCommitteeKey,
        committee_name: targetCommitteeKey,
        status: 'shifted',
        shift_history: [...currentShiftHistory, newShiftEntry],
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateErr) {
      throw new Error(updateErr.message || 'فشل تحويل المتقدم إلى اللجنة الأخرى.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'SHIFT_APPLICANT',
      entity_type: 'applications',
      entity_id: id,
      details: `تحويل المتقدم ${existingApp.applicant_name} من ${existingApp.committee_key} إلى ${targetCommitteeKey}. السبب: ${reason}`
    });
  }
};
