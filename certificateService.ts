import { supabase } from '../lib/supabase';
import { CertificateItem, EventRegistration, Profile } from '../types';
import { settingsService } from './settingsService';
import { auditService } from './auditService';
import { eventService } from './eventService';

export const certificateService = {
  /**
   * Get all issued certificates
   */
  async getAllCertificates(): Promise<CertificateItem[]> {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('issued_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const events = await eventService.getEvents();
        const evMap = new Map(events.map(e => [e.id, e]));

        return data.map(c => {
          const ev = evMap.get(String(c.event_id));
          return {
            id: String(c.id),
            event_id: String(c.event_id),
            registration_id: String(c.registration_id),
            verification_code: c.verification_code,
            recipient_name: c.recipient_name,
            event_title: c.event_title || ev?.title || 'فعالية Aliens Space الأكاديمية',
            event_date: c.event_date || ev?.event_date || new Date().toISOString(),
            signatory_name: c.signatory_name || 'Aliens Space High Board',
            signatory_title: c.signatory_title || 'Academic & Board Lead',
            issued_at: c.issued_at,
            user_id: c.user_id || undefined
          };
        });
      }
    } catch (e) {
      console.warn('getAllCertificates exception:', e);
    }
    return [];
  },

  /**
   * Get certificate by verification code
   */
  async getCertificateByVerificationCode(code: string): Promise<CertificateItem | null> {
    const cleanCode = code.trim().toUpperCase();
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .ilike('verification_code', cleanCode)
        .maybeSingle();

      if (error || !data) return null;

      const ev = await eventService.getEventById(String(data.event_id));

      return {
        id: String(data.id),
        event_id: String(data.event_id),
        registration_id: String(data.registration_id),
        verification_code: data.verification_code,
        recipient_name: data.recipient_name,
        event_title: data.event_title || ev?.title || 'فعالية Aliens Space الأكاديمية',
        event_date: data.event_date || ev?.event_date || new Date().toISOString(),
        signatory_name: data.signatory_name || 'Aliens Space High Board',
        signatory_title: data.signatory_title || 'Academic & Board Lead',
        issued_at: data.issued_at,
        user_id: data.user_id || undefined
      };
    } catch (e) {
      console.warn('getCertificateByVerificationCode exception:', e);
      return null;
    }
  },

  /**
   * Issue a certificate for an attended registration
   */
  async issueCertificateForRegistration(registration: EventRegistration, actor?: Profile): Promise<CertificateItem> {
    if (!registration) throw new Error('بيانات التسجيل غير متوفرة.');

    // 1. Verify event allows certificates
    const event = await eventService.getEventById(registration.event_id);
    if (!event || !event.certificate_enabled) {
      throw new Error('هذه الفعالية لا تدعم إصدار الشهادات التقديرية.');
    }

    // 2. Verify registration has completed attendance
    if (registration.attendance_status !== 'attended') {
      throw new Error('عفواً، لم تقم بإكمال حضور الفعالية أو لم يتم تأكيد حضورك بعد من قبل المنظمين.');
    }

    // 3. Check if already issued
    const { data: existing } = await supabase
      .from('certificates')
      .select('*')
      .eq('registration_id', registration.id)
      .maybeSingle();

    if (existing) {
      return {
        id: String(existing.id),
        event_id: String(existing.event_id),
        registration_id: String(existing.registration_id),
        verification_code: existing.verification_code,
        recipient_name: existing.recipient_name,
        event_title: existing.event_title || event.title,
        event_date: existing.event_date || event.event_date,
        signatory_name: existing.signatory_name,
        signatory_title: existing.signatory_title,
        issued_at: existing.issued_at,
        user_id: existing.user_id || undefined
      };
    }

    // 4. Fetch dynamic signatory from site settings
    const settings = await settingsService.getSiteSettings();
    const verificationCode = 'AS-CERT-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Date.now().toString(36).substring(3).toUpperCase();

    const payload = {
      event_id: registration.event_id,
      registration_id: registration.id,
      recipient_name: registration.registrant_name.trim(), // strictly derived from registration
      user_id: registration.user_id || null,
      verification_code: verificationCode,
      signatory_name: settings.certificate_signatory_name,
      signatory_title: settings.certificate_signatory_title,
      event_title: event.title,
      event_date: event.event_date,
      issued_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('certificates')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل إصدار الشهادة في قاعدة البيانات.');
    }

    if (actor) {
      await auditService.logAction({
        actor_name: actor.full_name,
        actor_role: actor.role,
        actor_id: actor.id,
        action: 'ISSUE_CERTIFICATE',
        entity_type: 'certificates',
        entity_id: String(data.id),
        details: `إصدار شهادة الحضور للمشارك ${data.recipient_name} للفعالية ${event.title}`
      });
    }

    return {
      id: String(data.id),
      event_id: String(data.event_id),
      registration_id: String(data.registration_id),
      verification_code: data.verification_code,
      recipient_name: data.recipient_name,
      event_title: event.title,
      event_date: event.event_date,
      signatory_name: data.signatory_name,
      signatory_title: data.signatory_title,
      issued_at: data.issued_at,
      user_id: data.user_id || undefined
    };
  }
};
