import { supabase } from '../lib/supabase';
import { MemoryItem, Profile } from '../types';

export const memoryService = {
  /**
   * Fetch all team memories from Supabase
   */
  async getMemories(): Promise<MemoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          comments:memory_comments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('getMemories database error:', error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map(m => ({
          id: String(m.id),
          user_id: m.user_id,
          author_name: m.author_name || 'عضو Aliens',
          author_avatar: m.author_avatar,
          memory_text: m.memory_text,
          image_url: m.image_url,
          likes_count: m.likes_count || 0,
          user_liked: false,
          created_at: m.created_at,
          comments: (m.comments || []).map((c: any) => ({
            id: String(c.id),
            user_id: c.user_id,
            author_name: c.author_name,
            comment_text: c.comment_text,
            created_at: c.created_at
          }))
        }));
      }
    } catch (e) {
      console.warn('getMemories exception:', e);
    }
    return [];
  },

  /**
   * Post a new memory
   */
  async createMemory(text: string, imageUrl?: string, author?: Profile): Promise<MemoryItem> {
    const payload = {
      user_id: author?.id || null,
      author_name: author?.full_name || 'عضو الكيان',
      author_avatar: author?.avatar_url || null,
      memory_text: text.trim(),
      image_url: imageUrl || null,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('memories')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل نشر الذكرى.');
    }

    return {
      id: String(data.id),
      user_id: data.user_id,
      author_name: data.author_name,
      author_avatar: data.author_avatar,
      memory_text: data.memory_text,
      image_url: data.image_url,
      likes_count: 0,
      created_at: data.created_at,
      comments: []
    };
  },

  /**
   * Like a memory
   */
  async likeMemory(memoryId: string): Promise<number> {
    try {
      const { data: mem } = await supabase.from('memories').select('likes_count').eq('id', memoryId).single();
      const currentLikes = mem?.likes_count || 0;
      await supabase.from('memories').update({ likes_count: currentLikes + 1 }).eq('id', memoryId);
      return currentLikes + 1;
    } catch (e) {
      return 1;
    }
  },

  /**
   * Add a comment to a memory
   */
  async addComment(memoryId: string, commentText: string, author?: Profile): Promise<any> {
    const payload = {
      memory_id: memoryId,
      user_id: author?.id || null,
      author_name: author?.full_name || 'عضو الكيان',
      comment_text: commentText.trim(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('memory_comments')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل إضافة التعليق.');
    }

    return data;
  }
};
