/**
 * services/certificates.js
 * Database-backed certificates issuance, persistence, verification code generation, public verification.
 */
const CertificatesService = {
  async issueCertificateForRegistration(registration) {
    if (!window.sb || !registration) return null;

    // Fetch event to confirm certificate_enabled
    const { data: event, error: evErr } = await window.sb
      .from('events')
      .select('*')
      .eq('id', registration.event_id)
      .single();

    if (evErr || !event || !event.certificate_enabled) {
      return null;
    }

    if (registration.attendance_status !== 'attended') {
      return null;
    }

    // Check if already issued
    const { data: existing } = await window.sb
      .from('certificates')
      .select('*')
      .eq('registration_id', registration.id)
      .maybeSingle();

    if (existing) return existing;

    // Generate unique immutable verification code
    const verificationCode = 'AS-CERT-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();

    // Fetch signatory from settings
    let signatoryName = 'Aliens High Board';
    let signatoryTitle = 'President & Academic Lead';
    try {
      const { data: settings } = await window.sb.from('site_settings').select('*');
      const setMap = new Map((settings || []).map(s => [s.setting_key, s.setting_value]));
      if (setMap.get('signatory_name')) signatoryName = setMap.get('signatory_name');
      if (setMap.get('signatory_title')) signatoryTitle = setMap.get('signatory_title');
    } catch (e) {}

    const payload = {
      event_id: registration.event_id,
      registration_id: registration.id,
      recipient_name: registration.registrant_name, // strictly derived from registration
      user_id: registration.user_id || null,
      verification_code: verificationCode,
      signatory_name: signatoryName,
      signatory_title: signatoryTitle,
      issued_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('certificates')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error creating certificate:", error);
      throw error;
    }
    return data;
  },

  async getMyCertificates(userId) {
    if (!window.sb || !userId) return [];
    try {
      const { data, error } = await window.sb
        .from('certificates')
        .select('*, events(title, description, event_date, image_url)')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (error) {
        console.warn("Error fetching certificates:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async verifyCertificate(code) {
    if (!window.sb || !code) throw new Error("Verification code is required.");
    const cleanCode = String(code).trim().toUpperCase();

    const { data, error } = await window.sb
      .from('certificates')
      .select('verification_code, recipient_name, issued_at, signatory_name, signatory_title, events(title, event_date)')
      .eq('verification_code', cleanCode)
      .maybeSingle();

    if (error || !data) {
      throw new Error("الشهادة غير موجودة أو كود التحقق غير صالح.");
    }
    return data;
  }
};

window.CertificatesService = CertificatesService;
