import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Send, Sparkles, User, ShieldCheck } from 'lucide-react';
import { MemoryItem, Profile } from '../../types';
import { ApiService } from '../../services/api';

interface MemoriesViewProps {
  currentUser: Profile | null;
  onOpenAuth: () => void;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({ currentUser, onOpenAuth }) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [activeCommentMemoryId, setActiveCommentMemoryId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const loadMemories = async () => {
    const data = await ApiService.getMemories();
    setMemories(data);
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    setLoading(true);
    try {
      const actor = currentUser || ({
        id: `guest_${Date.now()}`,
        full_name: authorName.trim() || 'عضو من عائلة Aliens',
        role: 'guest',
        email: 'guest@aliens.space',
        username: 'guest'
      } as Profile);

      await ApiService.createMemory(
        newMemoryText.trim(),
        undefined,
        actor
      );
      setNewMemoryText('');
      await loadMemories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (memoryId: string) => {
    await ApiService.likeMemory(memoryId);
    setMemories(prev => prev.map(m => {
      if (m.id === memoryId) {
        return { ...m, likes_count: m.likes_count + 1 };
      }
      return m;
    }));
  };

  const handleAddComment = async (memoryId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    await ApiService.addCommentToMemory(
      memoryId,
      currentUser?.full_name || 'صيدلي زائر',
      commentText.trim()
    );
    setCommentText('');
    await loadMemories();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 text-slate-100">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-800 text-pink-300 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 fill-pink-400" />
          <span>جدار الذكريات والأثر الدائم</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          نبض عائلة Aliens ومشاعر الأعضاء
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
          شارك رسالتك، ذكرياتك في ورش العمل والمؤتمرات، وشكرك لزملائك وأعضاء اللجان.
        </p>
      </div>

      {/* Memory Composer Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>أضف بصمتك وذكرى جديدة على الجدار</span>
        </h3>

        <form onSubmit={handleCreateMemory} className="space-y-3">
          {!currentUser && (
            <div>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="اسمك أو لقبك (مثال: د. سارة - كلية صيدلة)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-pink-500 text-slate-100 text-xs"
              />
            </div>
          )}

          <textarea
            rows={3}
            required
            value={newMemoryText}
            onChange={e => setNewMemoryText(e.target.value)}
            placeholder="اكتب رسالتك أو ذكرى لا تنساها مع تيم Aliens..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-pink-500 text-slate-100 text-xs resize-none"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              {currentUser ? `النشر بحساب: ${currentUser.full_name}` : 'يمكنك النشر كزائر أو تسجيل الدخول'}
            </span>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'جاري النشر...' : 'نشر الذكرى'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Memories Feed */}
      <div className="space-y-6">
        {memories.map((mem) => (
          <div
            key={mem.id}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
          >
            {/* Author bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/40 flex items-center justify-center font-bold text-pink-300">
                  {mem.author_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{mem.author_name}</h4>
                  <span className="text-[11px] text-slate-500">{mem.created_at}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLike(mem.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-pink-400 hover:text-pink-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Heart className="w-4 h-4 fill-pink-500/20" />
                  <span>{mem.likes_count}</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {mem.memory_text}
            </p>

            {/* Comments toggle & list */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={() => setActiveCommentMemoryId(activeCommentMemoryId === mem.id ? null : mem.id)}
                  className="flex items-center gap-1 hover:text-slate-200"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>التعليقات ({mem.comments.length})</span>
                </button>
              </div>

              {/* Comments box */}
              {activeCommentMemoryId === mem.id && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {mem.comments.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span className="font-bold text-slate-300">{c.author_name}</span>
                          <span>{c.created_at}</span>
                        </div>
                        <p className="text-slate-300">{c.comment_text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={(e) => handleAddComment(mem.id, e)} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="اكتب رداً لطيفاً..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-pink-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs"
                    >
                      إرسال
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
