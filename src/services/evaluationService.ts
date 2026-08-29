import { supabase } from '../lib/supabase';
import { EvaluationItem, Profile } from '../types';
import { profileService } from './profileService';
import { auditService } from './auditService';

export const evaluationService = {
  /**
   * Get all evaluations accessible to the user
   */
  async getAllEvaluations(currentUser?: Profile): Promise<EvaluationItem[]> {
    try {
      let query = supabase
        .from('performance_evaluations')
        .select('*')
        .order('created_at', { ascending: false });

      // If regular evaluator, filter to evaluations created by them or their assigned members
      if (currentUser && currentUser.role === 'ir_evaluator') {
        query = query.eq('evaluator_id', currentUser.id);
      } else if (currentUser && currentUser.role === 'member') {
        query = query.eq('member_id', currentUser.id);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('getAllEvaluations error:', error);
        return [];
      }

      const profiles = await profileService.getAllProfiles();
      const profMap = new Map(profiles.map(p => [p.id, p]));

      return (data || []).map(row => {
        const mem = profMap.get(row.member_id);
        const evalProf = profMap.get(row.evaluator_id);

        return {
          id: String(row.id),
          member_id: row.member_id,
          member_name: row.member_name || mem?.full_name || 'عضو الفريق',
          member_committee: row.member_committee || mem?.committee_key || 'عام',
          evaluator_id: row.evaluator_id,
          evaluator_name: row.evaluator_name || evalProf?.full_name || 'مسؤول التقييم',
          evaluation_month: row.evaluation_month,
          score: Number(row.score),
          criteria_scores: row.criteria_scores ? (typeof row.criteria_scores === 'object' ? row.criteria_scores : JSON.parse(row.criteria_scores)) : undefined,
          notes: row.notes,
          created_at: row.created_at
        };
      });
    } catch (e) {
      console.warn('getAllEvaluations exception:', e);
      return [];
    }
  },

  /**
   * Get evaluations for a specific member
   */
  async getMemberEvaluations(memberId: string): Promise<EvaluationItem[]> {
    const all = await this.getAllEvaluations();
    return all.filter(e => e.member_id === memberId);
  },

  /**
   * Submit or update a monthly performance evaluation
   */
  async submitMonthlyEvaluation(
    evalData: {
      member_id: string;
      evaluation_month: string;
      score: number;
      criteria_scores?: {
        commitment: number;
        communication: number;
        task_quality: number;
        initiative: number;
      };
      notes?: string;
    },
    actor: Profile
  ): Promise<EvaluationItem> {
    const member = (await profileService.getAllProfiles()).find(p => p.id === evalData.member_id);
    if (!member) throw new Error('العضو المطلوب تقييمه غير موجود.');

    // Validate score range
    const validScore = Math.max(0, Math.min(100, Number(evalData.score)));

    // Check for existing evaluation in the same month
    const { data: existing } = await supabase
      .from('performance_evaluations')
      .select('id')
      .eq('member_id', evalData.member_id)
      .eq('evaluation_month', evalData.evaluation_month)
      .maybeSingle();

    const payload = {
      member_id: evalData.member_id,
      member_name: member.full_name,
      member_committee: member.committee_key,
      evaluator_id: actor.id,
      evaluator_name: actor.full_name,
      evaluation_month: evalData.evaluation_month,
      score: validScore,
      criteria_scores: evalData.criteria_scores || {
        commitment: 25,
        communication: 25,
        task_quality: 25,
        initiative: 25
      },
      notes: evalData.notes?.trim() || '',
      created_at: new Date().toISOString()
    };

    let resultData;
    if (existing) {
      // Update existing evaluation
      const { data, error } = await supabase
        .from('performance_evaluations')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message || 'فشل تحديث التقييم.');
      resultData = data;
    } else {
      // Insert new evaluation
      const { data, error } = await supabase
        .from('performance_evaluations')
        .insert([payload])
        .select()
        .single();
      if (error) throw new Error(error.message || 'فشل حفظ التقييم الجديد.');
      resultData = data;
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'SUBMIT_EVALUATION',
      entity_type: 'performance_evaluations',
      entity_id: String(resultData.id),
      details: `تقييم العضو ${member.full_name} لشهر ${evalData.evaluation_month} بدرجة ${validScore}/100`
    });

    return {
      id: String(resultData.id),
      member_id: resultData.member_id,
      member_name: member.full_name,
      member_committee: member.committee_key,
      evaluator_id: resultData.evaluator_id,
      evaluator_name: actor.full_name,
      evaluation_month: resultData.evaluation_month,
      score: Number(resultData.score),
      criteria_scores: resultData.criteria_scores,
      notes: resultData.notes,
      created_at: resultData.created_at
    };
  }
};
