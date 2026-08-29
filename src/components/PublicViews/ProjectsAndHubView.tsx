import React, { useState, useEffect } from 'react';
import { Briefcase, BookOpen, Code, ExternalLink, MapPin, Building, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProjectItem, InternshipItem, ArticleItem } from '../../types';
import { ApiService } from '../../services/api';

export const ProjectsAndHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'internships' | 'articles'>('projects');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [internships, setInternships] = useState<InternshipItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);

  useEffect(() => {
    ApiService.getProjects().then(setProjects);
    ApiService.getInternships().then(setInternships);
    ApiService.getArticles().then(setArticles);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-100">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>حاضنة الابتكار والفرص الصيدلانية</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          مركز المعرفة، المشاريع، والتدريب الصيفي
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          استكشف مشاريع الطلاب، فرص التدريب الميداني في مصانع الدواء، والمقالات العلمية التخصصية.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>مشاريع الطلاب البرمجية والبحثية ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('internships')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'internships'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>فرص التدريب الصيفي والمصانع ({internships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'articles'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>المقالات الصيدلانية ({articles.length})</span>
        </button>
      </div>

      {/* TAB 1: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                    {proj.committee}
                  </span>
                  {proj.featured && (
                    <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                      مشروع مميز
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-100">{proj.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  فريق العمل: <strong>{proj.team_members.join('، ')}</strong>
                </span>

                {proj.demo_url && (
                  <a
                    href={proj.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>رابط المشروع</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: INTERNSHIPS */}
      {activeTab === 'internships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {internships.map((intern) => (
            <div
              key={intern.id}
              className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">{intern.company_name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">
                    {intern.field}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100">{intern.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{intern.description}</p>

                <div className="space-y-1.5 pt-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الموقع: {intern.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>فترة التدريب: {intern.duration} — الموعد النهائي: {intern.deadline}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[11px] font-bold text-slate-300 block">شروط التقديم:</span>
                  <ul className="text-xs text-slate-400 list-disc list-inside space-y-0.5">
                    {intern.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end">
                <a
                  href={intern.apply_link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <span>تقديم طلب التدريب</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ARTICLES */}
      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((art) => (
            <div
              key={art.id}
              className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-500">{art.published_at}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-100">{art.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">{art.content}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  بقلم: <strong className="text-slate-200">{art.author_name}</strong>
                </span>
                <span className="text-slate-500 font-mono text-[10px]">قراءة 4 دقائق</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
