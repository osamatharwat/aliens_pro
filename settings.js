/**
 * services/settings.js
 * Site settings, recruitment status, PR phones, projects, internships, and cultural resources.
 */
const SettingsService = {
  async getSettings() {
    if (!window.sb) return new Map();
    try {
      const { data, error } = await window.sb.from('site_settings').select('*');
      if (error) return new Map();
      return new Map((data || []).map(row => [row.setting_key, row.setting_value]));
    } catch (e) {
      return new Map();
    }
  },

  async updateSettings(settingsList) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.sb
      .from('site_settings')
      .upsert(settingsList, { onConflict: 'setting_key' });
    if (error) throw error;
    return data;
  },

  async getProjects() {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('member_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  async getInternships() {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('internships')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  async getCulturalResources() {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('cultural_resources')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  async deleteRow(tableName, id) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { error } = await window.sb
      .from(tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

window.SettingsService = SettingsService;
