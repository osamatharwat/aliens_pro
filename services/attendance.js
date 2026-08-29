/**
 * services/attendance.js
 * Event registrations, duplicate checks, attendance tracking (attended / not_completed).
 */
const AttendanceService = {
  async registerForEvent(eventId, userData) {
    if (!window.sb || !eventId) throw new Error("Supabase or event ID missing.");

    const { registrant_name, phone, email, user_id } = userData;
    if (!registrant_name || !phone) throw new Error("الاسم ورقم الهاتف مطلوبين للتسجيل.");

    // Check duplicate phone for this event
    const { data: existing, error: dupErr } = await window.sb
      .from('event_registrations')
      .select('id, ticket_code, attendance_status')
      .eq('event_id', eventId)
      .eq('phone', phone.trim())
      .maybeSingle();

    if (!dupErr && existing) {
      throw new Error(`أنت مسجل بالفعل في هذه الفعالية بكود تذكرة: ${existing.ticket_code}`);
    }

    // Generate unique ticket code
    const ticketCode = 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString(36).toUpperCase().slice(-4);

    const payload = {
      event_id: eventId,
      user_id: user_id || null,
      registrant_name: registrant_name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      ticket_code: ticketCode,
      attendance_status: 'registered',
      created_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('event_registrations')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRegistrationsByEvent(eventId) {
    if (!window.sb || !eventId) return [];
    const { data, error } = await window.sb
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMyRegistrations(userId) {
    if (!window.sb || !userId) return [];
    const { data, error } = await window.sb
      .from('event_registrations')
      .select('*, events(title, description, certificate_enabled, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error getting user registrations:", error);
      return [];
    }
    return data || [];
  },

  async markAttendance(registrationId, status, markerId) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    if (!['attended', 'not_completed', 'registered'].includes(status)) {
      throw new Error("حالة الحضور غير صالحة.");
    }

    const { data, error } = await window.sb
      .from('event_registrations')
      .update({
        attendance_status: status,
        attendance_marked_by: markerId || null,
        attendance_marked_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) throw error;

    // If attended and certificate is enabled for the event, prepare certificate
    if (status === 'attended') {
      try {
        if (window.CertificatesService) {
          await window.CertificatesService.issueCertificateForRegistration(data);
        }
      } catch (certErr) {
        console.warn("Certificate auto-issue notice:", certErr);
      }
    }

    return data;
  }
};

window.AttendanceService = AttendanceService;
