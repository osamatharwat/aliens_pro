import React, { useState } from 'react';
import { ShieldCheck, Search, Award, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';
import { CertificateItem } from '../../types';
import { ApiService } from '../../services/api';

interface CertificatesViewProps {
  onViewCertificate: (cert: CertificateItem) => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ onViewCertificate }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultCert, setResultCert] = useState<CertificateItem | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResultCert(null);
    setSearched(false);

    if (!code.trim()) {
      setErrorMsg('يرجى إدخال رمز التحقق للشهادة.');
      return;
    }

    setLoading(true);
    try {
      const cert = await ApiService.verifyCertificate(code);
      setSearched(true);
      if (cert) {
        setResultCert(cert);
      } else {
        setErrorMsg('رمز التحقق المدخل غير موجود في السجل الأكاديمي المعتمد.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء فحص الشهادة.');
    } finally {
      setLoading(false);
    }
  };

  const sampleCodes = [
    'AS-CERT-8849-DELTA',
    'AS-CERT-9012-DELTA'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 text-slate-100">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>المنظومة المركزية لتوثيق الشهادات</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          التحقق الرقمي من شهادات Aliens Space
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
          تحقق من صحة ومصداقية الشهادات الممنوحة للمشاركين في المؤتمرات والبرامج التدريبية المعتمدة من كلية الصيدلة — جامعة الدلتا.
        </p>
      </div>

      {/* Verification Box */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-xs font-bold text-slate-200">
            أدخل كود التحقق المطبوع على الشهادة أو الممسوح عبر الـ QR:
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: AS-CERT-8849-DELTA"
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-100 text-sm font-mono tracking-wider text-center sm:text-right"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'جاري التحقق...' : 'فحص الشهادة'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-2">
            <span>أكواد تجريبية صالحة للفحص:</span>
            {sampleCodes.map(sc => (
              <button
                key={sc}
                type="button"
                onClick={() => setCode(sc)}
                className="font-mono text-emerald-400 underline hover:text-emerald-300"
              >
                {sc}
              </button>
            ))}
          </div>
        </form>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Verification Success Card */}
        {resultCert && (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>شهادة أصلية ومعتمدة رسمياً</span>
              </div>
              <span className="font-mono text-xs text-emerald-300 font-bold">{resultCert.verification_code}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">اسم الحاصل على الشهادة:</span>
                <span className="text-base font-bold text-slate-100">{resultCert.recipient_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">اسم المؤتمر / الفعالية:</span>
                <span className="text-base font-bold text-emerald-300">{resultCert.event_title}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">تاريخ الإصدار:</span>
                <span className="text-slate-200">{new Date(resultCert.issued_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">جهة الاعتماد:</span>
                <span className="text-slate-200">عمادة كلية الصيدلة — جامعة الدلتا</span>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-900/60 flex items-center justify-end">
              <button
                onClick={() => onViewCertificate(resultCert)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>عرض وتحميل الشهادة الأصلية (PNG / Print)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Architecture Facts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
          <h4 className="font-bold text-slate-200">توليد حتمي (Deterministic)</h4>
          <p>تولد بيانات الشهادة حصرياً من سجلات الحضور المعتمدة في قاعدة البيانات دون إمكانية التعديل من جهة العميل.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
          <h4 className="font-bold text-slate-200">تشفير الكود الأكاديمي</h4>
          <p>يحمل كل مستند كوداً فريداً مرتبطاً بـ Hash مسجل في سجلات الحضور لمنع التكرار والتزوير.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
          <h4 className="font-bold text-slate-200">الربط بجامعة الدلتا</h4>
          <p>كافة التوقيعات والأختام الرقمية معتمدة من رئيس الكيان وعمادة كلية الصيدلة.</p>
        </div>
      </div>

    </div>
  );
};
