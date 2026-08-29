import React from 'react';
import { Sparkles, ShieldCheck, Award, Target, BookOpen, Users, Compass, ChevronLeft } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (route: string) => void;
  onOpenRecruitment: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, onOpenRecruitment }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 text-slate-100">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>تاريخ ورؤية كيان Aliens</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          نبني قادة الصيدلة والبحث العلمي في دلتا مصر
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          تأسس كيان Aliens في كلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا ليكون الجسر الحقيقي بين المناهج الأكاديمية الصيدلانية ومتطلبات سوق العمل الدوائي والبحثي الحديث.
        </p>
      </div>

      {/* Pillars Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">الرؤية الاستراتيجية (Vision)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            أن نكون الكيان الطلابي الصيدلاني الأكثر تأثيراً وابتكاراً في مصر، من خلال تخريج كوادر تمتلك أحدث مهارات التحليل الدوائي، الرعاية الإكلينيكية، والقيادة المؤسسية.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">الرسالة الأكاديمية (Mission)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            تقديم بيئة تعليمية وعملية تفاعلية للطلاب عبر المؤتمرات العلمية، معسكرات القيادة، تدريبات المصانع، وورش العمل التخصصية بالتعاون مع كبرى الشركات.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">القيم الحاكمة (Core Values)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            الأمانة العلمية، العمل الجماعي العابر للتخصصات، تمكين المبادرات الفردية، والالتزام المجتمعي عبر القوافل الطبية والتوعية الصحية.
          </p>
        </div>
      </div>

      {/* Leadership & High Board Structure */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            الهيكل القيادي ومجلس الإدارة
          </h2>
          <p className="text-xs text-slate-400">
            نظام حوكمة متزن يضمن تكافؤ الصلاحيات بين رؤساء ونواب اللجان وتحت إشراف أكاديمي مباشر.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/40 text-center space-y-3 shadow-xl shadow-emerald-950/30">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 mx-auto flex items-center justify-center text-emerald-400 text-2xl font-bold font-mono">
              OG
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">د. أسامة ثروت الجوهري</h4>
              <p className="text-xs text-emerald-400 font-semibold">رئيس الكيان والمؤسس (President &amp; OG)</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              إشراف عام على السياسات الأكاديمية والعلاقات الخارجية، وتطوير الرؤية الرقمية للمنظومة.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/40 text-center space-y-3 shadow-xl shadow-cyan-950/30">
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-500/60 mx-auto flex items-center justify-center text-cyan-400 text-2xl font-bold font-mono">
              HB
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">مجلس القيادة العليا (High Board)</h4>
              <p className="text-xs text-cyan-400 font-semibold">Team Heads &amp; Sub Heads</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              إدارة العمليات اليومية، تنسيق خطط اللجان التسع، ومتابعة جودة الفعاليات الأكاديمية.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-teal-500/40 text-center space-y-3 shadow-xl shadow-teal-950/30">
            <div className="w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-500/60 mx-auto flex items-center justify-center text-teal-400 text-2xl font-bold font-mono">
              BD
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">مجلس رؤساء اللجان (The Board)</h4>
              <p className="text-xs text-teal-400 font-semibold">Heads &amp; Sub Heads of 9 Committees</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              رؤساء ونواب اللجان التسع بصلاحيات متكافئة لإدارة ورش العمل وتدريب الأعضاء.
            </p>
          </div>
        </div>
      </div>

      {/* Alliance with Delta University Pharmacy */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>الشراكة الأكاديمية الرسمية</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
            تحت رعاية عمادة كلية الصيدلة — جامعة الدلتا
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            تحظى كافة فعاليات ومؤتمرات وشهادات Aliens باعتماد مباشر من عمادة كلية الصيدلة، وتوفر الجامعة كافة القاعات والمختبرات المجهزة لدعم أنشطة الطلاب.
          </p>
        </div>

        <button
          onClick={onOpenRecruitment}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 shadow-lg shadow-emerald-500/20 transition-all"
        >
          انضم لعائلة Aliens الآن
        </button>
      </div>

    </div>
  );
};
