import { supabase } from '../lib/supabase';
import { EventItem, Profile } from '../types';
import { auditService } from './auditService';

export const eventService = {
  /**
   * Get all published events (or all events for admin)
   */
  async getEvents(): Promise<EventItem[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        console.warn('getEvents error:', error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map(ev => ({
          id: String(ev.id),
          title: ev.title,
          description: ev.description || '',
          event_date: ev.event_date || new Date().toISOString(),
          location: ev.location || 'مقر الكيان',
          image_url: ev.image_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
          category: ev.category || 'technical',
          is_public: ev.is_public !== false,
          is_published: ev.is_published !== false,
          certificate_enabled: Boolean(ev.certificate_enabled),
          registration_open: ev.registration_open !== false,
          capacity: Number(ev.capacity) || 100,
          current_attendees_count: Number(ev.current_attendees_count) || 0,
          whatsapp_group_url: ev.whatsapp_group_url || undefined,
          action_link: ev.action_link || undefined,
          created_at: ev.created_at || new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('getEvents exception:', e);
    }

    return [];
  },

  /**
   * Get single event by ID
   */
  async getEventById(id: string): Promise<EventItem | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: String(data.id),
      title: data.title,
      description: data.description || '',
      event_date: data.event_date || new Date().toISOString(),
      location: data.location || 'مقر الكيان',
      image_url: data.image_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      category: data.category || 'technical',
      is_public: data.is_public !== false,
      is_published: data.is_published !== false,
      certificate_enabled: Boolean(data.certificate_enabled),
      registration_open: data.registration_open !== false,
      capacity: Number(data.capacity) || 100,
      current_attendees_count: Number(data.current_attendees_count) || 0,
      whatsapp_group_url: data.whatsapp_group_url || undefined,
      action_link: data.action_link || undefined,
      created_at: data.created_at || new Date().toISOString()
    };
  },

  /**
   * Create new event (Authorized leaders)
   */
  async createEvent(eventData: Partial<EventItem>, actor: Profile): Promise<EventItem> {
    const payload = {
      title: eventData.title?.trim(),
      description: eventData.description?.trim() || '',
      event_date: eventData.event_date,
      location: eventData.location?.trim() || 'مقر الكيان',
      image_url: eventData.image_url || null,
      category: eventData.category || 'technical',
      is_public: eventData.is_public !== false,
      is_published: eventData.is_published !== false,
      certificate_enabled: Boolean(eventData.certificate_enabled),
      registration_open: eventData.registration_open !== false,
      capacity: Number(eventData.capacity) || 100,
      whatsapp_group_url: eventData.whatsapp_group_url || null,
      action_link: eventData.action_link || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل إضافة الفعالية الجديدة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'CREATE_EVENT',
      entity_type: 'events',
      entity_id: String(data.id),
      details: `أنشأ فعالية: ${data.title}`
    });

    return {
      id: String(data.id),
      title: data.title,
      description: data.description,
      event_date: data.event_date,
      location: data.location,
      image_url: data.image_url,
      category: data.category,
      is_public: data.is_public,
      is_published: data.is_published,
      certificate_enabled: data.certificate_enabled,
      registration_open: data.registration_open,
      capacity: data.capacity,
      current_attendees_count: 0,
      whatsapp_group_url: data.whatsapp_group_url,
      action_link: data.action_link,
      created_at: data.created_at
    };
  },

  /**
   * Update event
   */
  async updateEvent(id: string, updates: Partial<EventItem>, actor: Profile): Promise<EventItem> {
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل تعديل الفعالية.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UPDATE_EVENT',
      entity_type: 'events',
      entity_id: id,
      details: `تعديل بيانات فعالية: ${data.title}`
    });

    return {
      id: String(data.id),
      title: data.title,
      description: data.description,
      event_date: data.event_date,
      location: data.location,
      image_url: data.image_url,
      category: data.category,
      is_public: data.is_public,
      is_published: data.is_published,
      certificate_enabled: data.certificate_enabled,
      registration_open: data.registration_open,
      capacity: data.capacity,
      current_attendees_count: Number(data.current_attendees_count) || 0,
      whatsapp_group_url: data.whatsapp_group_url,
      action_link: data.action_link,
      created_at: data.created_at
    };
  },

  /**
   * Delete event
   */
  async deleteEvent(id: string, actor: Profile): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'فشل حذف الفعالية.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'DELETE_EVENT',
      entity_type: 'events',
      entity_id: id,
      details: `حذف الفعالية`
    });
  }
};
