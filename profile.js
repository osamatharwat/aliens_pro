/**
 * services/profile.js
 * Profile and user permissions service layer.
 */
const ProfileService = {
  async getProfile(userId) {
    if (!window.sb || !userId) return null;
    const { data, error } = await window.sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error("Fetch profile error:", error);
      return null;
    }
    return data;
  },

  async getAllProfiles() {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async updateProfile(userId, updates) {
    if (!window.sb || !userId) throw new Error("Missing user ID");
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await window.sb
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async uploadAvatar(file, userId) {
    if (!window.uploadImage) throw new Error("Image uploader not available");
    const avatarUrl = await window.uploadImage(file, 'avatars');
    if (avatarUrl && userId) {
      await this.updateProfile(userId, { avatar_url: avatarUrl });
    }
    return avatarUrl;
  },

  async deleteProfile(userId) {
    if (!window.sb || !userId) throw new Error("Missing user ID");
    const { error } = await window.sb
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (error) throw error;
    return true;
  }
};

window.ProfileService = ProfileService;
