import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, Sparkles, Mail, Lock, User } from 'lucide-react';
import { ApiService } from '../services/api';
import { Profile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: Profile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!identifier.trim()) throw new Error('يرجى إدخال اسم المستخدم أو البريد الإلكتروني.');
        const user = await ApiService.signIn(identifier, password);
        onSuccess(user);
        onClose();
      } else if (mode === 'signup') {
        if (!fullName.trim() || !username.trim() || !email.trim()) {
          throw new Error('يرجى ملء جميع الحقول المطلوبة.');
        }
        const user = await ApiService.signUp(email, fullName, username);
        onSuccess(user);
        onClose();
      } else if (mode === 'reset') {
        if (!email.trim()) throw new Error('يرجى إدخال البريد الإلكتروني.');
        setResetSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء المصادقة.');
    } finally {
      setLoading(false);
    }
  };

  // Quick switch presets for evaluation
  const handleQuickLogin = async (ident: string) => {
    setError('');
    setLoading(true);
    try {
      const user = await ApiService.signIn(ident);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {mode === 'signin' && 'تسجيل الدخول إلى المنظومة'}
                {mode === 'signup' && 'إنشاء حساب جديد'}
                {mode === 'reset' && 'استعادة كلمة المرور'}
              </h3>
              <p className="text-[10px] text-slate-400">منظومة ALIENS SPACE الرقمية</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          {mode === 'reset' && resetSent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">تم إرسال تعليمات الاستعادة</h4>
              <p className="text-xs text-slate-400">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى <strong>{email}</strong>.
              </p>
              <button
                onClick={() => { setMode('signin'); setResetSent(false); }}
                className="mt-2 text-xs text-emerald-400 underline"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>الاسم بالكامل *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="مثال: يوسف أحمد رضوان"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>اسم المستخدم (Username) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="youssef_pharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs font-mono"
                    />
                  </div>
                </>
              )}

              {mode !== 'signup' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>اسم المستخدم أو البريد الإلكتروني *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="osama.sarwat75@gmail.com أو aliens_president"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>البريد الإلكتروني *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@aliens-space.org"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
                  />
                </div>
              )}

              {mode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>كلمة المرور *</span>
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {mode === 'signin' && <LogIn className="w-4 h-4" />}
                {mode === 'signup' && <UserPlus className="w-4 h-4" />}
                {mode === 'reset' && <KeyRound className="w-4 h-4" />}
                <span>
                  {loading
                    ? 'جاري التحقق...'
                    : mode === 'signin'
                    ? 'دخول إلى الحساب'
                    : mode === 'signup'
                    ? 'تسجيل حساب جديد'
                    : 'إرسال رابط الاستعادة'}
                </span>
              </button>
            </form>
          )}

          {/* Switch Modes */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            {mode === 'signin' ? (
              <p>
                ليس لديك حساب بعد؟{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  إنشاء حساب مستخدم جديد
                </button>
              </p>
            ) : (
              <p>
                لديك حساب بالفعل؟{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}
          </div>

          {/* Quick Demo Switchers for Evaluator */}
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            <p className="text-[10px] text-slate-500 mb-2 text-center">أو التبديل السريع لحسابات الأدوار للاختبار:</p>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('aliens_president')}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-950 font-mono text-center truncate"
                title="President & OG"
              >
                👑 OG / President
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('omar_data')}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-950 font-mono text-center truncate"
                title="Data Analysis Head"
              >
                📊 Data Analysis Head
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ahmed_evaluator')}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-950 font-mono text-center truncate"
                title="IR Evaluator"
              >
                🔍 IR Evaluator
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
