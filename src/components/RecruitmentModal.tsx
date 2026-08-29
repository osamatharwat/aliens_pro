import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, CheckCircle2, ChevronRight, ChevronLeft, Layers, User, Phone, Mail, GraduationCap } from 'lucide-react';
import { ApiService } from '../services/api';
import { Committee, CommitteeKey, DynamicQuestion, ApplicationItem } from '../types';

interface RecruitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCommitteeKey?: CommitteeKey;
  onSubmitted?: (app: ApplicationItem) => void;
}

export const RecruitmentModal: React.FC<RecruitmentModalProps> = ({
  isOpen,
  onClose,
  initialCommitteeKey,
  onSubmitted
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<CommitteeKey>(initialCommitteeKey || 'data_analysis');
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [facultyLevel, setFacultyLevel] = useState('الفرقة الثالثة — كلية الصيدلة');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<ApplicationItem | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      ApiService.getAllCommittees().then(setCommittees);
      if (initialCommitteeKey) {
        setSelectedCommittee(initialCommitteeKey);
      }
    }
  }, [isOpen, initialCommitteeKey]);

  useEffect(() => {
    if (isOpen && selectedCommittee) {
      setLoadingQuestions(true);
      ApiService.getQuestionsByCommittee(selectedCommittee)
        .then(q => {
          setQuestions(q);
          setLoadingQuestions(false);
        })
        .catch(() => setLoadingQuestions(false));
    }
  }, [isOpen, selectedCommittee]);

  if (!isOpen) return null;

  const handleAnswerChange = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!applicantName.trim() || !phone.trim()) {
        setErrorMessage('يرجى إدخال الاسم بالكامل ورقم الهاتف.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedCommittee) {
        setErrorMessage('يرجى اختيار اللجنة المراد التقديم لها.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    // Check if at least one question answered if questions exist
    if (questions.length > 0) {
      const answeredCount = Object.values(answers).filter(v => typeof v === 'string' && v.trim().length > 0).length;
      if (answeredCount === 0) {
        setErrorMessage('يرجى الإجابة على أسئلة الاستمارة الموضحة.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const app = await ApiService.submitApplication({
        applicant_name: applicantName,
        phone,
        email: email || `${phone}@applicant.local`,
        faculty_level: facultyLevel,
        committee_key: selectedCommittee,
        dynamic_answers: answers
      });
      setSubmittedApp(app);
      setStep(4);
      if (onSubmitted) onSubmitted(app);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء إرسال الاستمارة.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setApplicantName('');
    setPhone('');
    setEmail('');
    setAnswers({});
    setSubmittedApp(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">استمارة التقديم والانضمام — ALIENS SPACE</h3>
              <p className="text-[11px] text-slate-400">موسم التوظيف الأكاديمي 2026</p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-800/60 flex items-center justify-between text-xs font-semibold">
            <span className={step === 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>1. البيانات الشخصية</span>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
            <span className={step === 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>2. اختيار اللجنة</span>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
            <span className={step === 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>3. أسئلة المقابلة</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الاسم بالكامل (ثلاثي أو رباعي) *</span>
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>رقم الهاتف / واتساب *</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>البريد الإلكتروني</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الفرقة الدراسية والكلية *</span>
                </label>
                <select
                  value={facultyLevel}
                  onChange={e => setFacultyLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs"
                >
                  <option value="الفرقة الأولى — كلية الصيدلة">الفرقة الأولى — كلية الصيدلة</option>
                  <option value="الفرقة الثانية — كلية الصيدلة">الفرقة الثانية — كلية الصيدلة</option>
                  <option value="الفرقة الثالثة — كلية الصيدلة">الفرقة الثالثة — كلية الصيدلة</option>
                  <option value="الفرقة الرابعة — كلية الصيدلة">الفرقة الرابعة — كلية الصيدلة</option>
                  <option value="الفرقة الخامسة (Pharm D) — كلية الصيدلة">الفرقة الخامسة (Pharm D) — كلية الصيدلة</option>
                  <option value="سنة الامتياز / خريج">سنة الامتياز / خريج</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Committee Selection */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 mb-2">اختر اللجنة التي ترغب في الانضمام إليها:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {committees.map((comm) => {
                  const isSelected = selectedCommittee === comm.key;
                  return (
                    <div
                      key={comm.key}
                      onClick={() => setSelectedCommittee(comm.key)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-200">{comm.arabic_name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{comm.description}</p>
                      <span className="inline-block mt-2 text-[10px] text-emerald-400 font-mono">
                        {comm.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Dynamic Questions */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
                <span>اللجنة المختارة: <strong>{committees.find(c => c.key === selectedCommittee)?.arabic_name}</strong></span>
                <button 
                  onClick={() => setStep(2)}
                  className="text-[11px] underline text-emerald-400 hover:text-emerald-300"
                >
                  تغيير اللجنة
                </button>
              </div>

              {loadingQuestions ? (
                <div className="py-8 text-center text-xs text-slate-400">جاري تحميل أسئلة المقابلة...</div>
              ) : questions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">لا توجد أسئلة إضافية مطلوبة لهذه اللجنة. يمكنك المتابعة للإرسال.</div>
              ) : (
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-200">
                        {idx + 1}. {q.question_text}
                      </label>
                      <textarea
                        rows={3}
                        value={answers[q.id] || ''}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                        placeholder="اكتب إجابتك هنا بوضوح واختصار..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Success Confirmation */}
          {step === 4 && submittedApp && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">تم استلام طلب التقديم بنجاح!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  شكراً لك يا <strong>{submittedApp.applicant_name}</strong>، تم تسجيل طلبك للجنة <strong>{submittedApp.committee_name}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-right space-y-2 max-w-md mx-auto">
                <div className="flex justify-between text-slate-400">
                  <span>رقم الطلب المرجعي:</span>
                  <span className="font-mono text-emerald-400 font-bold">{submittedApp.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>حالة الطلب:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 font-semibold">
                    قيد المراجعة والفحص الأكاديمي
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                  سيقوم مسؤولو لجنة الـ IR واللجنة المختارة بمراجعة استمارتك والتواصل معك عبر الواتساب لتحديد موعد المقابلة الشخصية.
                </p>
              </div>

              <button
                onClick={resetAndClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Buttons */}
        {step < 4 && (
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'جاري الإرسال...' : 'تأكيد وإرسال الاستمارة'}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
