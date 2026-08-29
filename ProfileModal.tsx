import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  Edit3, 
  Save, 
  LogOut, 
  Layers, 
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Profile, EvaluationItem } from '../types';
import { profileService } from '../services/profileService';
import { evaluationService } from '../services/evaluationService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile | null;
  onProfileUpdated: (updated: Profile) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [studentId, setStudentId] = useState(currentUser?.student_id || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setPhone(currentUser.phone || '');
      setStudentId(currentUser.student_id || '');
      setAvatarUrl(currentUser.avatar_url || '');
      loadUserEvaluations();
    }
  }, [currentUser, isOpen]);

  // Body scroll lock and ESC key handling
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prev || 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const loadUserEvaluations = async () => {
    if (!currentUser) return;
    try {
      const list = await evaluationService.getMemberEvaluations(currentUser.id);
      setEvaluations(list);
    } catch {
      // non-blocking
    }
  };

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updated = await profileService.updateProfile(
        currentUser.id,
        {
          full_name: fullName.trim(),
          phone: phone.trim(),
          student_id: studentId.trim(),
          avatar_url: avatarUrl.trim() || undefined
        }
      );

      onProfileUpdated(updated);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'تم تحديث بيانات الملف الشخصي بنجاح!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'فشل حفظ التعديلات.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-emerald-900/60 via-slate-900 to-teal-900/60 p-6 flex items-start justify-between border-b border-slate-800 relative">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>حساب موثق في منصة Aliens Space</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Avatar and Main Info Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950 border-4 border-slate-900 shadow-xl overflow-hidden flex items-center justify-center text-emerald-400 text-3xl font-black shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser.full_name.charAt(0)}</span>
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-100">{currentUser.full_name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-700 text-emerald-300 font-mono font-bold">
                    {currentUser.role.toUpperCase()}
                  </span>
                  {currentUser.committee_key && (
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                      لجنة: {currentUser.committee_key}
                    </span>
                  )}
                  {currentUser.committee_position && (
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-teal-950 border border-teal-800 text-teal-300 font-semibold">
                      {currentUser.committee_position}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل البيانات</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
                >
                  إلغاء
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' 
                : 'bg-red-950/60 border border-red-800 text-red-300'
            }`}>
              {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Edit Form / View Mode */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الاسم بالكامل
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم الهاتف / واتساب
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الرقم الجامعي / الفرقة الدراسية
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="مثال: الفرقة الرابعة — صيدلة إكلينيكية"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رابط الصورة الشخصية (Avatar URL)
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>البريد الإلكتروني</span>
                </span>
                <p className="text-xs font-bold text-slate-200">{currentUser.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>اسم المستخدم</span>
                </span>
                <p className="text-xs font-mono font-bold text-slate-200">@{currentUser.username}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>رقم الهاتف</span>
                </span>
                <p className="text-xs font-bold text-slate-200">{currentUser.phone || 'غير مسجل'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>البيانات الأكاديمية</span>
                </span>
                <p className="text-xs font-bold text-slate-200">{currentUser.student_id || 'كلية الصيدلة — جامعة الدلتا'}</p>
              </div>
            </div>
          )}

          {/* Evaluations Section if available */}
          {evaluations.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">سجل التقييم الشهري المعتمد</h3>
              </div>

              <div className="space-y-2">
                {evaluations.map((ev) => (
                  <div 
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">شهر: {ev.evaluation_month}</span>
                      {ev.notes && <p className="text-[11px] text-slate-400 mt-0.5">{ev.notes}</p>}
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">
                        {ev.score} / 100
                      </span>
                      <span className="text-[10px] text-slate-500 block">تقييم الـ IR</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
