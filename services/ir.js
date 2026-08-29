/**
 * services/ir.js
 * Internal Relations evaluator management, member assignment, and workload distribution.
 */
const IRService = {
  MAX_LOAD_PER_EVALUATOR: 30,

  async getEligibleEvaluators() {
    if (!window.sb) return [];
    // Eligible evaluators are profiles with is_evaluator=true or role in ['ir', 'hr', 'ir_evaluator', 'ir_head', 'ir_sub_head', 'OG'] or committee='ir'
    const { data: allProfiles, error } = await window.sb
      .from('profiles')
      .select('id, full_name, username, role, committee, committee_key, is_evaluator, avatar_url')
      .order('full_name', { ascending: true });

    if (error) throw error;

    const evaluators = (allProfiles || []).filter(p => 
      p.is_evaluator === true ||
      ['ir', 'hr', 'ir_evaluator', 'ir_head', 'ir_sub_head', 'OG'].includes(p.role) ||
      (p.committee && p.committee.toLowerCase() === 'ir') ||
      (p.committee_key && p.committee_key.toLowerCase() === 'ir')
    );

    // Calculate current active assigned load for each evaluator
    const { data: assignments } = await window.sb
      .from('profiles')
      .select('id, assigned_ir');

    const loadMap = {};
    (assignments || []).forEach(row => {
      if (row.assigned_ir) {
        loadMap[row.assigned_ir] = (loadMap[row.assigned_ir] || 0) + 1;
      }
    });

    return evaluators.map(ev => ({
      ...ev,
      current_load: loadMap[ev.id] || 0,
      remaining_capacity: Math.max(0, this.MAX_LOAD_PER_EVALUATOR - (loadMap[ev.id] || 0))
    }));
  },

  async getUnassignedMembers() {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('profiles')
      .select('*')
      .is('assigned_ir', null)
      .neq('role', 'OG')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async assignMember(memberId, evaluatorId) {
    if (!window.sb) throw new Error("Supabase is not initialized.");

    // Check capacity first
    if (evaluatorId) {
      const { count, error: countErr } = await window.sb
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_ir', evaluatorId);

      if (!countErr && count !== null && count >= this.MAX_LOAD_PER_EVALUATOR) {
        throw new Error(`تم الوصول للحد الأقصى (${this.MAX_LOAD_PER_EVALUATOR} عضو) لهذا المقيم.`);
      }
    }

    const { data, error } = await window.sb
      .from('profiles')
      .update({
        assigned_ir: evaluatorId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async assignApplication(applicationId, evaluatorId) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.sb
      .from('applications')
      .update({
        ir_assignee_id: evaluatorId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

window.IRService = IRService;
