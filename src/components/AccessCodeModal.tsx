import React, { useState } from 'react';
import { X, Key, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApiService } from '../services/api';
import { Profile } from '../types';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile | null;
  onSuccess: (updatedUser: Profile) => void;
  onOpenAuth: () => void;
}

export const AccessCodeModal: React.FC<AccessCodeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  onOpenAuth
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redeemedData, setRedeemedData] = useState<Profile | null>(null);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('يجب تسجيل الدخول أولاً لتفعيل كود الترقية.');
      return;
    }

    if (!code.trim()) {
      setError('يرجى إدخال كود الترقية.');
      return;
    }

    setLoading(true);
    try {
      const updated = await ApiService.redeemAccessCode(code, currentUser);
      setRedeemedData(updated);
      onSuccess(updated);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#3b82f6', '#fbbf24']
      });
    } catch (err: any) {
      setError(err.message || 'فشل تفعيل كود الترقية.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPaste = (sampleCode: string) => {
    setCode(sampleCode);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">تفعيل كود عضوية / ترقية</h3>
              <p className="text-[10px] text-slate-400">Committee Access Code Activation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!currentUser ? (
            <div className="text-center py-6 space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">تسجيل الدخول مطلوب</h4>
              <p className="text-xs text-slate-400">
                لتفعيل كود الترقية وربط صلاحيات اللجنة بحسابك، يجب تسجيل الدخول أولاً.
              </p>
              <button
                onClick={() => { onClose(); onOpenAuth(); }}
                className="mt-2 px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                تسجيل الدخول الآن
              </button>
            </div>
          ) : redeemedData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">مبارك! تم تفعيل الرتبة بنجاح</h4>
                <p className="text-xs text-slate-300 mt-1">
                  أهلاً بك كـ <strong className="text-emerald-400">{redeemedData.committee_position || 'عضو'}</strong> في لجنة <strong className="text-emerald-400">{redeemedData.committee_key}</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1 text-right">
                <p>• تم منحك كامل صلاحيات غرفة العمليات التابعة للجنة.</p>
                <p>• يمكنك الآن إدارة المهام، متابعة المتقدمين، وتنسيق الأنشطة.</p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                الدخول لغرفة العمليات
              </button>
            </div>
          ) : (
            <form onSubmit={handleRedeem} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  أدخل كود الوصول السري (Access Code) *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="ALIENS-DATA-HEAD-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-amber-300 font-mono text-center tracking-widest text-sm font-bold uppercase"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  يتم تسليم الأكواد السرية رسمياً من قِبل مجلس الإدارة (OG &amp; High Board) فقط.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'جاري التحقق والتفعيل...' : 'تفعيل الكود والترقية فوراً'}</span>
              </button>

              {/* Sample codes for testing */}
              <div className="pt-3 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-500 mb-2 text-center">أكواد تجريبية صالحة للاختبار السريع:</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => handleQuickPaste('ALIENS-DATA-HEAD-2026')}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-950 text-right truncate"
                  >
                    👑 Data Head Code
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPaste('ALIENS-DATA-MEMBER-99')}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-950 text-right truncate"
                  >
                    👤 Data Member Code
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
