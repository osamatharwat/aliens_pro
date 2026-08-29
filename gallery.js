/**
 * services/gallery.js
 * Visual gallery images and user likes.
 */
const GalleryService = {
  async getGalleryImages() {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching gallery images:", error);
      return [];
    }
    return data || [];
  },

  async getUserLikes(userId) {
    if (!window.sb || !userId) return new Set();
    const { data, error } = await window.sb
      .from('gallery_likes')
      .select('image_name')
      .eq('user_id', userId);

    if (error) return new Set();
    return new Set((data || []).map(row => String(row.image_name)));
  },

  async getLikeCount(imageId) {
    if (!window.sb) return 0;
    const { count, error } = await window.sb
      .from('gallery_likes')
      .select('*', { count: 'exact', head: true })
      .eq('image_name', String(imageId));

    if (error) return 0;
    return count || 0;
  },

  async toggleLike(imageId, userId, isLiked) {
    if (!window.sb || !userId) throw new Error("Authentication required.");
    if (isLiked) {
      const { error } = await window.sb
        .from('gallery_likes')
        .delete()
        .eq('image_name', String(imageId))
        .eq('user_id', userId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await window.sb
        .from('gallery_likes')
        .insert([{ image_name: String(imageId), user_id: userId }]);
      if (error) throw error;
      return true;
    }
  },

  async addImages(sectionName, urls) {
    if (!window.sb || !urls.length) throw new Error("No images provided.");
    const rows = urls.map(url => ({
      section_name: sectionName.trim(),
      image_url: url,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await window.sb
      .from('gallery_images')
      .insert(rows);

    if (error) throw error;
    return data;
  },

  async deleteImage(id) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { error } = await window.sb
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

window.GalleryService = GalleryService;
