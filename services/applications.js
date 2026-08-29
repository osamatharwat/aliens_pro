/**
 * services/applications.js
 * Recruitment applications flow: submit, IR review, Committee head review, decision, shift.
 */
const ApplicationsService = {
  async submitApplication(data) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const payload = {
      applicant_name: data.applicant_name.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim() : null,
      faculty_level: data.faculty_level,
      committee_key: data.committee_key.toLowerCase(),
      committee_name: data.committee_name || data.committee_key,
      dynamic_answers: data.dynamic_answers || {},
      role_requested: 'Member',
      status: 'new',
      ir_status: 'pending',
      committee_decision: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: result, error } = await window.sb
      .from('applications')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async getApplications(filter = {}) {
    if (!window.sb) return [];
    let query = window.sb.from('applications').select('*').order('created_at', { ascending: false });

    if (filter.committee_key) {
      query = query.eq('committee_key', filter.committee_key.toLowerCase());
    }
    if (filter.ir_assignee_id) {
      query = query.eq('ir_assignee_id', filter.ir_assignee_id);
    }
    if (filter.status) {
      query = query.eq('status', filter.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateApplication(id, updates) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await window.sb
      .from('applications')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async shiftApplication(appId, newCommitteeKey, newCommitteeName, shiftedBy) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { data: currentApp, error: fetchErr } = await window.sb
      .from('applications')
      .select('*')
      .eq('id', appId)
      .single();

    if (fetchErr) throw fetchErr;

    const history = Array.isArray(currentApp.shift_history) ? currentApp.shift_history : [];
    history.push({
      from_committee: currentApp.committee_key,
      to_committee: newCommitteeKey,
      shifted_by: shiftedBy,
      timestamp: new Date().toISOString()
    });

    const { data, error } = await window.sb
      .from('applications')
      .update({
        committee_key: newCommitteeKey,
        committee_name: newCommitteeName || newCommitteeKey,
        status: 'shifted',
        committee_decision: 'pending',
        shift_history: history,
        updated_at: new Date().toISOString()
      })
      .eq('id', appId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteApplication(id) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { error } = await window.sb
      .from('applications')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

window.ApplicationsService = ApplicationsService;
