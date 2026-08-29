import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Calendar, 
  ShieldCheck, 
  Users, 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  BarChart3, 
  ExternalLink,
  Heart,
  ChevronLeft,
  Search,
  FileCheck
} from 'lucide-react';
import { Committee, EventItem, MemoryItem, ProjectItem, CertificateItem } from '../../types';
import { ApiService } from '../../services/api';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onOpenRecruitment: (committeeKey?: any) => void;
  onViewCertificate: (cert: CertificateItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenRecruitment,
  onViewCertificate
}) => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  
  // Quick verify search
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    ApiService.getAllCommittees().then(setCommittees);
    ApiService.getEvents().then(setEvents);
    ApiService.getMemories().then(m => setMemories(m.slice(0, 3)));
    ApiService.getProjects().then(setProjects);
  }, []);

  const handleQuickVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    if (!verifyCode.trim()) return;

    setVerifyLoading(true);
    try {
      const cert = await ApiService.verifyCertificate(verifyCode);
      if (!cert) {
        setVerifyError('كود الشهادة غير صحيح أو غير مسجل في قاعدة البيانات.');
      } else {
        onViewCertificate(cert);
      }
    } catch (err: any) {
      setVerifyError(err.message || 'خطأ في فحص الشهادة.');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="space-y-24 pb-20 text-slate-100">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Futuristic background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-6 shadow-lg shadow-emerald-950/50 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>باب التقديم للانضمام لموسم 2026 مفتوح الآن للجان التسع</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-sans leading-tight sm:leading-none">
            صنّاع المستقبل الصيدلاني في{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-mono">
              ALIENS SPACE
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            المنظومة الرقمية والنشاط الطلابي الأكاديمي الرائد في كلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا. ندمج العلوم الصيدلانية المتقدمة، تحليل البيانات، والتطوير القيادي لصناعة كوادر استثنائية.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenRecruitment()}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>تقديم طلب انضمام للكيان</span>
            </button>

            <button
              onClick={() => onNavigate('events')}
              className="px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>استكشاف المؤتمرات والفعاليات</span>
            </button>

            <button
              onClick={() => onNavigate('committees')}
              className="px-6 py-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-emerald-900/50 text-emerald-300 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>اللجان التسع</span>
            </button>
          </div>

          {/* 4 Bento Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-right">
              <span className="text-xs font-semibold text-slate-400 block mb-1">اللجان التخصصية</span>
              <p className="text-3xl font-black font-mono text-emerald-400">9 لجان</p>
              <span className="text-[11px] text-slate-500 mt-1 block">تشمل لجنة Data Analysis</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-right">
              <span className="text-xs font-semibold text-slate-400 block mb-1">الأعضاء النشطين</span>
              <p className="text-3xl font-black font-mono text-cyan-400">+140 عضواً</p>
              <span className="text-[11px] text-slate-500 mt-1 block">في مختلف التخصصات</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-right">
              <span className="text-xs font-semibold text-slate-400 block mb-1">المستفيدين من الفعاليات</span>
              <p className="text-3xl font-black font-mono text-teal-400">+3,200 طالب</p>
              <span className="text-[11px] text-slate-500 mt-1 block">من كليات الصيدلة بالدلتا</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-right">
              <span className="text-xs font-semibold text-slate-400 block mb-1">شهادات إتمام موثقة</span>
              <p className="text-3xl font-black font-mono text-emerald-400">100% معتمدة</p>
              <span className="text-[11px] text-slate-500 mt-1 block">قابلة للتحقق الرقمي الفوري</span>
            </div>
          </div>

        </div>
      </section>

      {/* QUICK CERTIFICATE VERIFY WIDGET */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-right w-full md:w-auto">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">فحص وتوثيق الشهادات الصادرة</h3>
              </div>
              <p className="text-xs text-slate-400">
                أدخل رمز الشهادة (مثل: <code className="text-emerald-300 font-mono">AS-CERT-8849-DELTA</code>) للتحقق من صحتها فوراً.
              </p>
            </div>

            <form onSubmit={handleQuickVerify} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.toUpperCase())}
                placeholder="AS-CERT-XXXX-XXXX"
                className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-100 text-xs font-mono tracking-wider w-full md:w-64"
              />
              <button
                type="submit"
                disabled={verifyLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{verifyLoading ? 'فحص...' : 'تحقق'}</span>
              </button>
            </form>
          </div>

          {verifyError && (
            <p className="mt-3 text-xs text-red-400 text-right">{verifyError}</p>
          )}
        </div>
      </section>

      {/* COMMITTEES SPOTLIGHT (9 COMMITTEES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              <span>الهيكل التنظيمي الأكاديمي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              اللجان التسع المتخصصة لكيان Aliens
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              تسع لجان متكاملة تعمل في تناغم، بما فيها لجنة تحليل البيانات والبحث الصيدلي.
            </p>
          </div>

          <button
            onClick={() => onNavigate('committees')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>استعراض كافة تفاصيل اللجان</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {committees.map((comm) => (
            <div
              key={comm.key}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                comm.key === 'data_analysis'
                  ? 'bg-slate-900/90 border-cyan-500/50 shadow-xl shadow-cyan-500/5'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                    {comm.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {comm.active_members_count} عضو نشط
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1">
                  {comm.arabic_name}
                </h3>
                <p className="text-xs text-emerald-400 font-mono mb-3">
                  {comm.name}
                </p>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {comm.description}
                </p>

                <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between">
                    <span>رئيس اللجنة (Head):</span>
                    <span className="font-semibold text-slate-200">{comm.head_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نائب الرئيس (Sub Head):</span>
                    <span className="font-semibold text-slate-200">{comm.sub_head_name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => onOpenRecruitment(comm.key)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
                >
                  تقديم لهذه اللجنة
                </button>
                <button
                  onClick={() => onNavigate('committees')}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING EVENTS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              <span>المؤتمرات وورش العمل</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              أحدث فعاليات ومعسكرات الكيان
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              فعاليات أكاديمية متخصصة تمنحك شهادات إتمام معتمدة وتطويراً حقيقياً في مجالات الصيدلة.
            </p>
          </div>

          <button
            onClick={() => onNavigate('events')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>استعراض كل الفعاليات والتذاكر</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300"
            >
              <div>
                {event.image_url && (
                  <div className="h-44 overflow-hidden relative">
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-emerald-400">
                      {event.category.toUpperCase()}
                    </div>
                  </div>
                )}

                <div className="p-5">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {new Date(event.event_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mb-2 leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  المقاعد: <strong>{event.current_attendees_count}</strong> / {event.capacity}
                </span>
                <button
                  onClick={() => onNavigate('events')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/10"
                >
                  حجز تذكرة
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT RESEARCH & PHARMACEUTICAL PROJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                الابتكار والبحث الصيدلي
              </span>
              <h2 className="text-2xl font-bold text-slate-100">
                مشاريع أعضاء Aliens في الذكاء الاصطناعي وتطوير الدواء
              </h2>
            </div>
            <button
              onClick={() => onNavigate('hub')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>استكشاف كافة المشاريع</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.slice(0, 2).map((proj) => (
              <div key={proj.id} className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-emerald-300">{proj.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-mono">
                    {proj.committee}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.tags.map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMORIES WALL PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Heart className="w-4 h-4" />
              <span>جدار الذكريات والأثر</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              لحظات لا تُنسى من مسيرة عائلة Aliens
            </h2>
          </div>
          <button
            onClick={() => onNavigate('memories')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
          >
            <span>عرض كل الذكريات</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memories.map((mem) => (
            <div key={mem.id} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400">
                    {mem.author_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{mem.author_name}</h4>
                    <span className="text-[10px] text-slate-500">{mem.created_at}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-pink-400">
                  <Heart className="w-4 h-4 fill-pink-500/20" />
                  <span>{mem.likes_count}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{mem.memory_text}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
