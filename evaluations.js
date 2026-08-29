/**
 * services/evaluations.js
 * Scoped monthly evaluations for Members, Evaluators, Committee Heads, and Team Heads.
 */
const EvaluationsService = {
  async getEvaluationsForMember(memberId) {
    if (!window.sb || !memberId) return [];
    const { data, error } = await window.sb
      .from('performance_evaluations')
      .select('*, profiles:evaluator_id(full_name, role, committee)')
      .eq('member_id', memberId)
      .order('evaluation_month', { ascending: false });

    if (error) {
      console.warn("Error fetching member evaluations:", error);
      return [];
    }
    return data || [];
  },

  async getEvaluatorScopeMembers(evaluatorId, isSuperAdmin = false) {
    if (!window.sb || !evaluatorId) return [];
    let query = window.sb.from('profiles').select('*').neq('role', 'OG');
    if (!isSuperAdmin) {
      query = query.eq('assigned_ir', evaluatorId);
    }
    const { data, error } = await query.order('full_name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async saveEvaluation(memberId, evaluatorId, month, score, notes) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      throw new Error("يجب أن تكون الدرجة بين 0 و 100.");
    }
    if (!month) throw new Error("يجب تحديد شهر التقييم.");

    const payload = {
      member_id: memberId,
      evaluator_id: evaluatorId,
      evaluation_month: month,
      score: numScore,
      notes: notes ? notes.trim() : '',
      created_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('performance_evaluations')
      .upsert([payload], { onConflict: 'member_id, evaluation_month' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

window.EvaluationsService = EvaluationsService;
