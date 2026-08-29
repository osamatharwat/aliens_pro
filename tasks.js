/**
 * services/tasks.js
 * Committee Workspaces: Tasks creation, assignment, and status updates.
 */
const TasksService = {
  async getTasksByCommittee(committeeKey) {
    if (!window.sb || !committeeKey) return [];
    try {
      const { data, error } = await window.sb
        .from('tasks')
        .select('*, profiles:assigned_to(full_name, avatar_url, username)')
        .eq('committee_key', committeeKey.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Tasks fetch notice:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async createTask(taskData) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const payload = {
      committee_key: taskData.committee_key.toLowerCase(),
      title: taskData.title.trim(),
      description: taskData.description ? taskData.description.trim() : null,
      assigned_to: taskData.assigned_to || null,
      due_date: taskData.due_date || null,
      status: taskData.status || 'todo',
      created_by: taskData.created_by,
      created_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('tasks')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTaskStatus(taskId, status) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.sb
      .from('tasks')
      .update({ status: status })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(taskId) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { error } = await window.sb
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  }
};

window.TasksService = TasksService;
