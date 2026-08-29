import { supabase } from '../lib/supabase';
import { EventItem, Profile } from '../types';
import { auditService } from './auditService';

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'ev_1',
    title: 'المؤتمر الصيدلي السنوي: آفاق الذكاء الاصطناعي في اكتشاف الأدوية',
    description: 'مؤتمر رائد يجمع نخبة من علماء الصيدلة والذكاء الاصطناعي لاستعراض أحدث الأبحاث العالمية في تصميم وتطوير الأدوية الحديثة.',
    event_date: '2026-09-15T10:00:00Z',
    location: 'مركز المؤتمرات الرئيسي — القاعة الكبرى',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    category: 'technical',
    is_public: true,
    is_published: true,
    certificate_enabled: true,
    registration_open: true,
    capacity: 350,
    current_attendees_count: 210,
    whatsapp_group_url: 'https://chat.whatsapp.com/aliens-annual-pharma',
    action_link: 'https://aliens-space.org/pharma-2026',
    created_at: new Date().toISOString()
  },
  {
    id: 'ev_2',
    title: 'ورشة عمل: القيادة وإدارة النزاعات في البيئات الطبية',
    description: 'تدريب تفاعلي عملي لتطوير مهارات الإقناع، القيادة الفعالة، والتعامل مع ضغوط العمل وإدارة فرق العمل الطبية المعقدة.',
    event_date: '2026-09-22T14:00:00Z',
    location: 'مقر الكيان — قاعة التدريب المتقدم',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    category: 'soft_skills',
    is_public: true,
    is_published: true,
    certificate_enabled: true,
    registration_open: true,
    capacity: 80,
    current_attendees_count: 65,
    whatsapp_group_url: 'https://chat.whatsapp.com/aliens-leadership-ws',
    action_link: 'https://aliens-space.org/leadership',
    created_at: new Date().toISOString()
  },
  {
    id: 'ev_3',
    title: 'هاكاثون تحليل البيانات الصحية والتطبيقات الصيدلانية',
    description: 'تحدي تقني لمدة 48 ساعة لبناء لوحات بيانات ونماذج تنبؤية لتحسين جودة الرعاية الصحية وإدارة الصيدليات الذكية.',
    event_date: '2026-10-05T09:00:00Z',
    location: 'معامل الحوسبة المركزية',
    image_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    category: 'hackathon',
    is_public: true,
    is_published: true,
    certificate_enabled: true,
    registration_open: true,
    capacity: 120,
    current_attendees_count: 88,
    whatsapp_group_url: 'https://chat.whatsapp.com/aliens-hackathon-2026',
    action_link: 'https://aliens-space.org/hackathon',
    created_at: new Date().toISOString()
  }
];

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

      if (!error && data && data.length > 0) {
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

    return DEFAULT_EVENTS;
  },

  /**
   * Get single event by ID
   */
  async getEventById(id: string): Promise<EventItem | null> {
    const events = await this.getEvents();
    return events.find(e => e.id === id) || null;
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
      current_attendees_count: 0,
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

    return data as EventItem;
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
