import { supabase } from '../lib/supabase';
import { Committee, CommitteeKey, Profile } from '../types';
import { auditService } from './auditService';

export const committeeService = {
  /**
   * Get all active committees from Supabase
   */
  async getAllCommittees(): Promise<Committee[]> {
    try {
      const { data, error } = await supabase
        .from('committees')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.warn('getAllCommittees database error:', error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map(c => ({
          id: String(c.id || c.key),
          key: c.key as CommitteeKey,
          name: c.name,
          arabic_name: c.name_ar || c.arabic_name || c.name,
          category: c.category || 'Operational',
          description: c.description || '',
          goals: Array.isArray(c.goals) ? c.goals : (c.goals ? JSON.parse(c.goals) : []),
          requirements: Array.isArray(c.requirements) ? c.requirements : (c.requirements ? JSON.parse(c.requirements) : []),
          head_name: c.head_name || 'قائد اللجنة',
          sub_head_name: c.sub_head_name || 'نائب القائد',
          active_members_count: c.active_members_count || 0,
          icon_name: c.icon || c.icon_name || 'Layers'
        }));
      }
    } catch (e) {
      console.warn('getAllCommittees exception:', e);
    }

    return [];
  },

  /**
   * Get committee details by key
   */
  async getCommitteeByKey(key: CommitteeKey): Promise<Committee | null> {
    const all = await this.getAllCommittees();
    return all.find(c => c.key === key) || null;
  },

  /**
   * Create committee (Authorized leadership only)
   */
  async createCommittee(committeeData: Partial<Committee>, actor: Profile): Promise<Committee> {
    const newComm = {
      key: committeeData.key,
      name: committeeData.name,
      name_ar: committeeData.arabic_name || committeeData.name,
      category: committeeData.category || 'Operational',
      description: committeeData.description || '',
      goals: committeeData.goals || [],
      requirements: committeeData.requirements || [],
      head_name: committeeData.head_name || 'قائد اللجنة',
      sub_head_name: committeeData.sub_head_name || 'نائب القائد',
      icon: committeeData.icon_name || 'Layers',
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('committees')
      .insert([newComm])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل إضافة اللجنة الجديدة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'CREATE_COMMITTEE',
      entity_type: 'committees',
      entity_id: String(data.id),
      details: `أنشأ لجنة ${data.name_ar || data.name}`
    });

    return {
      id: String(data.id),
      key: data.key as CommitteeKey,
      name: data.name,
      arabic_name: data.name_ar || data.name,
      category: data.category || 'Operational',
      description: data.description || '',
      goals: data.goals || [],
      requirements: data.requirements || [],
      head_name: data.head_name,
      sub_head_name: data.sub_head_name,
      active_members_count: 0,
      icon_name: data.icon || 'Layers'
    };
  },

  /**
   * Update committee
   */
  async updateCommittee(id: string, updates: Partial<Committee>, actor: Profile): Promise<Committee> {
    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.arabic_name !== undefined) payload.name_ar = updates.arabic_name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.head_name !== undefined) payload.head_name = updates.head_name;
    if (updates.sub_head_name !== undefined) payload.sub_head_name = updates.sub_head_name;

    const { data, error } = await supabase
      .from('committees')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل تحديث بيانات اللجنة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UPDATE_COMMITTEE',
      entity_type: 'committees',
      entity_id: id,
      details: `تحديث بيانات لجنة ${data.name_ar || data.name}`
    });

    return {
      id: String(data.id),
      key: data.key as CommitteeKey,
      name: data.name,
      arabic_name: data.name_ar || data.name,
      category: data.category || 'Operational',
      description: data.description || '',
      goals: data.goals || [],
      requirements: data.requirements || [],
      head_name: data.head_name,
      sub_head_name: data.sub_head_name,
      active_members_count: data.active_members_count || 0,
      icon_name: data.icon || 'Layers'
    };
  },

  /**
   * Archive / Deactivate committee safely
   */
  async archiveCommittee(id: string, actor: Profile): Promise<void> {
    const { error } = await supabase
      .from('committees')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'فشل أرشفة اللجنة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'ARCHIVE_COMMITTEE',
      entity_type: 'committees',
      entity_id: id,
      details: `أرشفة اللجنة`
    });
  }
};
