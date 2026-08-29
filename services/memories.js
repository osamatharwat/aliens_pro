/**
 * services/memories.js
 * Wall of memories, memory likes, and comments.
 */
const MemoriesService = {
  async getMemories() {
    if (!window.sb) return [];
    try {
      const { data, error } = await window.sb
        .from('memories')
        .select('*, profiles(full_name, avatar_url, username), memory_likes(user_id), memory_comments(id, author_name, comment_text, created_at)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("MemoriesService error:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async createMemory(userId, authorName, text, imageUrl = null) {
    if (!window.sb || !userId) throw new Error("Authentication required.");
    const payload = {
      user_id: userId,
      author_name: authorName || 'عضو',
      memory_text: text.trim(),
      image_url: imageUrl,
      is_approved: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('memories')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleLike(memoryId, userId, isCurrentlyLiked) {
    if (!window.sb || !userId) throw new Error("Authentication required.");
    if (isCurrentlyLiked) {
      const { error } = await window.sb
        .from('memory_likes')
        .delete()
        .eq('memory_id', memoryId)
        .eq('user_id', userId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await window.sb
        .from('memory_likes')
        .insert([{ memory_id: memoryId, user_id: userId }]);
      if (error) throw error;
      return true;
    }
  },

  async addComment(memoryId, userId, authorName, commentText) {
    if (!window.sb || !userId) throw new Error("Authentication required.");
    const payload = {
      memory_id: memoryId,
      user_id: userId,
      author_name: authorName || 'عضو',
      comment_text: commentText.trim(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('memory_comments')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMemory(memoryId) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { error } = await window.sb
      .from('memories')
      .delete()
      .eq('id', memoryId);
    if (error) throw error;
    return true;
  }
};

window.MemoriesService = MemoriesService;
