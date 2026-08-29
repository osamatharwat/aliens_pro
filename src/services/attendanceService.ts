import { supabase } from '../lib/supabase';
import { EventRegistration, Profile } from '../types';
import { auditService } from './auditService';

export const attendanceService = {
  /**
   * Get all event registrations
   */
  async getRegistrations(eventId?: string): Promise<EventRegistration[]> {
    try {
      let query = supabase
        .from('event_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventId && eventId !== 'all') {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(r => ({
          id: String(r.id),
          event_id: String(r.event_id),
          user_id: r.user_id || undefined,
          registrant_name: r.registrant_name,
          phone: r.phone,
          email: r.email || undefined,
          ticket_code: r.ticket_code,
          attendance_status: r.attendance_status || 'registered',
          attendance_marked_by: r.attendance_marked_by || undefined,
          attendance_marked_at: r.attendance_marked_at || undefined,
          created_at: r.created_at
        }));
      }
    } catch (e) {
      console.warn('getRegistrations exception:', e);
    }
    return [];
  },

  /**
   * Register a user or guest for an event
   */
  async registerForEvent(
    eventId: string,
    registrantName: string,
    phone: string,
    email?: string,
    userId?: string
  ): Promise<EventRegistration> {
    const cleanName = registrantName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email?.trim() || null;

    if (!cleanName || !cleanPhone) {
      throw new Error('الاسم ورقم الهاتف مطلوبان للتسجيل في الفعالية.');
    }

    // Generate unique ticket code
    const ticketCode = 'AS-TKT-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString(36).substring(4).toUpperCase();

    const payload = {
      event_id: eventId,
      user_id: userId || null,
      registrant_name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      ticket_code: ticketCode,
      attendance_status: 'registered',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل تسجيل تذكرة الفعالية.');
    }

    // Increment current attendees count for event
    try {
      await supabase.rpc('increment_event_attendees', { p_event_id: eventId });
    } catch (e) {
      // Fallback direct update
      const { data: ev } = await supabase.from('events').select('current_attendees_count').eq('id', eventId).single();
      if (ev) {
        await supabase.from('events').update({
          current_attendees_count: (ev.current_attendees_count || 0) + 1
        }).eq('id', eventId);
      }
    }

    return {
      id: String(data.id),
      event_id: String(data.event_id),
      user_id: data.user_id,
      registrant_name: data.registrant_name,
      phone: data.phone,
      email: data.email,
      ticket_code: data.ticket_code,
      attendance_status: data.attendance_status,
      created_at: data.created_at
    };
  },

  /**
   * Update attendance status by authorized leader ('attended' | 'not_completed')
   */
  async updateAttendance(
    registrationId: string,
    status: 'attended' | 'not_completed',
    actor: Profile
  ): Promise<EventRegistration> {
    const { data, error } = await supabase
      .from('event_registrations')
      .update({
        attendance_status: status,
        attendance_marked_by: actor.full_name,
        attendance_marked_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل تسجيل حالة الحضور.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UPDATE_ATTENDANCE',
      entity_type: 'event_registrations',
      entity_id: registrationId,
      details: `تسجيل حضور ${data.registrant_name} كـ ${status === 'attended' ? 'حاضر (مكتمل)' : 'غير مكتمل'}`
    });

    return {
      id: String(data.id),
      event_id: String(data.event_id),
      user_id: data.user_id,
      registrant_name: data.registrant_name,
      phone: data.phone,
      email: data.email,
      ticket_code: data.ticket_code,
      attendance_status: data.attendance_status,
      attendance_marked_by: data.attendance_marked_by,
      attendance_marked_at: data.attendance_marked_at,
      created_at: data.created_at
    };
  },

  /**
   * Look up registration by ticket code
   */
  async getTicketByCode(ticketCode: string): Promise<EventRegistration | null> {
    const cleanCode = ticketCode.trim().toUpperCase();
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .ilike('ticket_code', cleanCode)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: String(data.id),
      event_id: String(data.event_id),
      user_id: data.user_id,
      registrant_name: data.registrant_name,
      phone: data.phone,
      email: data.email,
      ticket_code: data.ticket_code,
      attendance_status: data.attendance_status,
      attendance_marked_by: data.attendance_marked_by,
      attendance_marked_at: data.attendance_marked_at,
      created_at: data.created_at
    };
  }
};
