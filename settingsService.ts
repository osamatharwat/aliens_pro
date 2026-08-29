import { supabase } from '../lib/supabase';
import { Profile, SiteSettings } from '../types';
import { auditService } from './auditService';

export const DEFAULT_SETTINGS: SiteSettings = {
  certificate_signatory_name: 'Aliens High Board & Academic Committee',
  certificate_signatory_title: 'President & Academic Lead',
  recruitment_open: true,
  contact_pr_phone: '+20 100 123 4567',
  contact_email: 'contact@aliens-space.org',
  hero_tagline: 'الكيان الأكاديمي والمهني الرائد لطلاب وخريجي كليات الصيدلة',
  about_statement: 'كيان طلابي وأكاديمي متكامل يسعى لتمكين وتطوير طلاب الصيدلة من خلال ورش العمل، المؤتمرات، الأبحاث العلمية، والأنشطة القيادية والمجتمعية.',
  academic_lead_name: 'د. كريم عبد العزيز'
};

export const settingsService = {
  /**
   * Get all site settings
   */
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (!error && data && data.length > 0) {
        const map = new Map(data.map(s => [s.setting_key, s.setting_value]));
        return {
          certificate_signatory_name: map.get('certificate_signatory_name') || DEFAULT_SETTINGS.certificate_signatory_name,
          certificate_signatory_title: map.get('certificate_signatory_title') || DEFAULT_SETTINGS.certificate_signatory_title,
          recruitment_open: map.has('recruitment_open') ? map.get('recruitment_open') === 'true' : DEFAULT_SETTINGS.recruitment_open,
          contact_pr_phone: map.get('contact_pr_phone') || DEFAULT_SETTINGS.contact_pr_phone,
          contact_email: map.get('contact_email') || DEFAULT_SETTINGS.contact_email,
          hero_tagline: map.get('hero_tagline') || DEFAULT_SETTINGS.hero_tagline,
          about_statement: map.get('about_statement') || DEFAULT_SETTINGS.about_statement,
          academic_lead_name: map.get('academic_lead_name') || DEFAULT_SETTINGS.academic_lead_name
        };
      }
    } catch (e) {
      console.warn('getSiteSettings exception:', e);
    }
    return DEFAULT_SETTINGS;
  },

  /**
   * Update site settings
   */
  async updateSiteSettings(settings: Partial<SiteSettings>, actor: Profile): Promise<SiteSettings> {
    const entries = Object.entries(settings);
    for (const [key, val] of entries) {
      await supabase
        .from('site_settings')
        .upsert({
          setting_key: key,
          setting_value: String(val),
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UPDATE_SETTINGS',
      entity_type: 'site_settings',
      details: `تحديث إعدادات النظام العامة`
    });

    return this.getSiteSettings();
  }
};
