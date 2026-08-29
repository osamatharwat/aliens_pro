/**
 * services/events.js
 * Database-backed events management: create, edit, delete, publish, capacity, certificate toggle.
 */
const EventsService = {
  async getPublicEvents() {
    if (!window.sb) return [];
    try {
      const { data, error } = await window.sb
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching public events:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn("EventsService error:", e);
      return [];
    }
  },

  async getAllEvents() {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getEventById(id) {
    if (!window.sb || !id) return null;
    const { data, error } = await window.sb
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createEvent(eventData) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const payload = {
      title: eventData.title.trim(),
      description: eventData.description.trim(),
      image_url: eventData.image_url || null,
      action_link: eventData.action_link ? eventData.action_link.trim() : null,
      committee_key: eventData.committee_key || null,
      category: eventData.category || 'general',
      is_public: eventData.is_public ?? true,
      is_published: eventData.is_published ?? true,
      capacity: eventData.capacity ? parseInt(eventData.capacity, 10) : null,
      whatsapp_group_url: eventData.whatsapp_group_url ? eventData.whatsapp_group_url.trim() : null,
      certificate_enabled: eventData.certificate_enabled ?? false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEvent(id, updates) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.sb
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEvent(id) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { error } = await window.sb
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

window.EventsService = EventsService;
