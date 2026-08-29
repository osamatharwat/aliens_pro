import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';

export const profileService = {
  /**
   * Get a profile by user ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        user_id: data.id,
        username: data.username || data.email?.split('@')[0],
        full_name: data.full_name || 'عضو Aliens',
        email: data.email || '',
        role: (data.role as UserRole) || 'registered_user',
        committee_key: data.committee_key || undefined,
        committee_position: data.committee_position || undefined,
        avatar_url: data.avatar_url || undefined,
        phone: data.phone || undefined,
        student_id: data.student_id || undefined,
        assigned_ir: data.assigned_ir || undefined,
        is_evaluator: Boolean(data.is_evaluator),
        created_at: data.created_at
      };
    } catch (err) {
      console.warn('getProfile error:', err);
      return null;
    }
  },

  /**
   * Get all active profiles for member directory / IR
   */
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('getAllProfiles error:', error);
        return [];
      }

      return (data || []).map(p => ({
        id: p.id,
        user_id: p.id,
        username: p.username || p.email?.split('@')[0],
        full_name: p.full_name || 'عضو',
        email: p.email || '',
        role: (p.role as UserRole) || 'registered_user',
        committee_key: p.committee_key || undefined,
        committee_position: p.committee_position || undefined,
        avatar_url: p.avatar_url || undefined,
        phone: p.phone || undefined,
        student_id: p.student_id || undefined,
        assigned_ir: p.assigned_ir || undefined,
        is_evaluator: Boolean(p.is_evaluator),
        created_at: p.created_at
      }));
    } catch (err) {
      console.warn('getAllProfiles exception:', err);
      return [];
    }
  },

  /**
   * Update allowed fields for a user profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const safeUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.full_name !== undefined) safeUpdates.full_name = updates.full_name.trim();
    if (updates.avatar_url !== undefined) safeUpdates.avatar_url = updates.avatar_url;
    if (updates.phone !== undefined) safeUpdates.phone = updates.phone.trim();
    if (updates.student_id !== undefined) safeUpdates.student_id = updates.student_id.trim();

    const { data, error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل تحديث البيانات الشخصية.');
    }

    return {
      id: data.id,
      user_id: data.id,
      username: data.username,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      committee_key: data.committee_key,
      committee_position: data.committee_position,
      avatar_url: data.avatar_url,
      phone: data.phone,
      student_id: data.student_id,
      assigned_ir: data.assigned_ir,
      is_evaluator: Boolean(data.is_evaluator),
      created_at: data.created_at
    };
  },

  /**
   * Update avatar image URL
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<Profile> {
    return this.updateProfile(userId, { avatar_url: avatarUrl });
  }
};
