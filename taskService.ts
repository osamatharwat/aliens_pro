import { supabase } from '../lib/supabase';
import { CommitteeKey, Profile, TaskItem } from '../types';
import { auditService } from './auditService';
import { profileService } from './profileService';

export const taskService = {
  /**
   * Get tasks for committee workspace
   */
  async getTasks(committeeKey?: string): Promise<TaskItem[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (committeeKey && committeeKey !== 'all') {
        query = query.eq('committee_key', committeeKey);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const profiles = await profileService.getAllProfiles();
        const profMap = new Map(profiles.map(p => [p.id, p]));

        return data.map(t => ({
          id: String(t.id),
          committee_key: t.committee_key as CommitteeKey,
          title: t.title,
          description: t.description || undefined,
          assigned_to: t.assigned_to || undefined,
          assigned_to_name: t.assigned_to ? profMap.get(t.assigned_to)?.full_name : undefined,
          status: t.status || 'todo',
          due_date: t.due_date || undefined,
          created_by: t.created_by || undefined,
          created_at: t.created_at || new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('getTasks exception:', e);
    }
    return [];
  },

  /**
   * Create a new task
   */
  async createTask(taskData: Partial<TaskItem>, actor: Profile): Promise<TaskItem> {
    const payload = {
      committee_key: taskData.committee_key,
      title: taskData.title?.trim(),
      description: taskData.description?.trim() || null,
      assigned_to: taskData.assigned_to || null,
      due_date: taskData.due_date || null,
      status: 'todo',
      created_by: actor.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل إنشاء المهمة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'CREATE_TASK',
      entity_type: 'tasks',
      entity_id: String(data.id),
      details: `إنشاء مهمة ${data.title} للجنة ${data.committee_key}`
    });

    return {
      id: String(data.id),
      committee_key: data.committee_key,
      title: data.title,
      description: data.description,
      assigned_to: data.assigned_to,
      status: data.status,
      due_date: data.due_date,
      created_by: data.created_by,
      created_at: data.created_at
    };
  },

  /**
   * Update task status ('todo' | 'in_progress' | 'completed')
   */
  async updateTaskStatus(taskId: string, status: 'todo' | 'in_progress' | 'completed', actor: Profile): Promise<TaskItem> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل تحديث حالة المهمة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UPDATE_TASK_STATUS',
      entity_type: 'tasks',
      entity_id: taskId,
      details: `تحديث حالة المهمة إلى ${status}`
    });

    return {
      id: String(data.id),
      committee_key: data.committee_key,
      title: data.title,
      description: data.description,
      assigned_to: data.assigned_to,
      status: data.status,
      due_date: data.due_date,
      created_by: data.created_by,
      created_at: data.created_at
    };
  },

  /**
   * Delete task
   */
  async deleteTask(taskId: string, actor: Profile): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw new Error(error.message || 'فشل حذف المهمة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'DELETE_TASK',
      entity_type: 'tasks',
      entity_id: taskId,
      details: `حذف المهمة`
    });
  }
};
