import { supabase } from '../lib/supabase';
import { MemoryItem, Profile } from '../types';

export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_1',
    user_id: 'usr_lead',
    author_name: 'د. كريم عبد العزيز',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    memory_text: 'فخور جداً بالجهد الاستثنائي الذي بذله فريق التنظيم والميديا في المؤتمر الصيدلي الأخير. الكيان يثبت يوماً بعد يوم ريادته وتأثيره الحقيقي على الطلاب.',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    likes_count: 48,
    user_liked: false,
    created_at: '2026-08-20T12:00:00Z',
    comments: [
      {
        id: 'c_1',
        user_id: 'usr_2',
        author_name: 'سارة طارق',
        comment_text: 'أفضل تجربة تنظيمية عشتها مع عائلة Aliens Space!',
        created_at: '2026-08-20T14:30:00Z'
      }
    ]
  },
  {
    id: 'mem_2',
    user_id: 'usr_3',
    author_name: 'عمر خالد',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    memory_text: 'المقابلات الشخصية للدفعة الجديدة عكست طاقات وشغف لا محدود. متحمسون جداً للعمل مع الكفاءات الجديدة.',
    likes_count: 32,
    user_liked: false,
    created_at: '2026-08-22T16:00:00Z',
    comments: []
  }
];

export const memoryService = {
  /**
   * Fetch all team memories
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

      if (!error && data && data.length > 0) {
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
    return DEFAULT_MEMORIES;
  },

  /**
   * Post a new memory
   */
  async createMemory(text: string, imageUrl?: string, author?: Profile): Promise<MemoryItem> {
    const payload = {
      user_id: author?.id || 'anonymous',
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
  async likeMemory(memoryId: string, userId?: string): Promise<number> {
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
      user_id: author?.id || 'anonymous',
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
