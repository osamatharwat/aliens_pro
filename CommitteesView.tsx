import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Target, 
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { Committee, CommitteeKey, DynamicQuestion } from '../../types';
import { ApiService } from '../../services/api';

interface CommitteesViewProps {
  onOpenRecruitment: (committeeKey?: CommitteeKey) => void;
}

export const CommitteesView: React.FC<CommitteesViewProps> = ({ onOpenRecruitment }) => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedCommittee, setExpandedCommittee] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getAllCommittees().then(setCommittees);
    ApiService.getAllQuestions().then(setQuestions);
  }, []);

  const categories = ['All', 'Operational', 'Tech & Media', 'Academics & PR', 'Community & Charity'];

  const filtered = activeCategory === 'All' 
    ? committees 
    : committees.filter(c => c.category === activeCategory);

  const toggleExpand = (key: string) => {
    setExpandedCommittee(expandedCommittee === key ? null : key);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-100">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>الهيكل التشغيلي والتخصصي</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          اللجان التسع لكيان Aliens Space
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          تعرف على لجان الكيان التخصصية، الأهداف التشغيلية، رؤساء ونواب اللجان، وشروط ومتطلبات الانضمام لكل لجنة.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {cat === 'All' ? 'كافة اللجان (9)' : cat}
          </button>
        ))}
      </div>

      {/* Committees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filtered.map((comm) => {
          const isExpanded = expandedCommittee === comm.key;
          const commQuestions = questions.filter(q => q.committee_key === comm.key);

          return (
            <div
              key={comm.key}
              className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 space-y-6 ${
                comm.key === 'data_analysis'
                  ? 'bg-slate-900/90 border-cyan-500/60 shadow-2xl shadow-cyan-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Meta */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                      {comm.category}
                    </span>
                    {comm.key === 'data_analysis' && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                        لجنة تخصصية رسمية
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-2">
                    {comm.arabic_name}
                  </h2>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5">
                    {comm.name}
                  </p>
                </div>

                <div className="text-left">
                  <span className="text-xs font-bold text-slate-200 block">
                    {comm.active_members_count} عضو
                  </span>
                  <span className="text-[10px] text-slate-500">حجم الفريق</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {comm.description}
              </p>

              {/* Leadership Bar (Head = Sub Head equality) */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">رئيس اللجنة (Head):</span>
                  <span className="font-bold text-slate-200">{comm.head_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">نائب الرئيس (Sub Head):</span>
                  <span className="font-bold text-slate-200">{comm.sub_head_name}</span>
                </div>
              </div>

              {/* Goals list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الأهداف والمخرجات التشغيلية:</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {comm.goals.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expandable Requirements & Questions */}
              {isExpanded && (
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  {/* Requirements */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300">متطلبات ومهارات الانضمام:</h4>
                    <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                      {comm.requirements.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Sample questions */}
                  {commQuestions.length > 0 && (
                    <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <h4 className="font-bold text-emerald-300 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>معاينة أسئلة المقابلة التخصصية:</span>
                      </h4>
                      <div className="space-y-1 text-slate-400">
                        {commQuestions.map((q, i) => (
                          <p key={q.id} className="text-[11px]">• {q.question_text}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  onClick={() => toggleExpand(comm.key)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <span>{isExpanded ? 'إخفاء التفاصيل الإضافية' : 'عرض الشروط والأسئلة'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => onOpenRecruitment(comm.key)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تقديم لهذه اللجنة</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
