import React from 'react';
import { Sparkles, ShieldCheck, Heart, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
  onOpenRecruitment: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenRecruitment }) => {
  return (
    <footer className="bg-[#050811] border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-mono tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                ALIENS SPACE
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              النشاط الطلابي الأكاديمي الرائد في كلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا. نسعى لبناء كوادر قيادية متميزة في صناعة الدواء والبحث العلمي.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                منظومة معتمدة رسمياً
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">الوصول السريع</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  الصفحة الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors">
                  عن الكيان ومجلس الإدارة
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('committees')} className="hover:text-emerald-400 transition-colors">
                  اللجان التخصصية التسع
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-emerald-400 transition-colors">
                  المؤتمرات وورش العمل
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('verify')} className="hover:text-emerald-400 transition-colors">
                  فحص وتوثيق الشهادات
                </button>
              </li>
            </ul>
          </div>

          {/* Committees list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">اللجان التسع</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => onNavigate('committees')} className="text-right hover:text-emerald-400 transition-colors">Marketing</button>
              <button onClick={() => onNavigate('committees')} className="text-right hover:text-emerald-400 transition-colors">PR &amp; Relations</button>
              <button onClick={() => onNavigate('committees')} className="text-right hover:text-emerald-400 transition-colors">Media &amp; Video</button>
              <button onClick={() => onNavigate('committees')} className="text-right hover:text-emerald-400 transition-colors">Internal Relations (IR)</button>
              <button onClick={() => onNavigate('committees')} className="text-right hover:text-emerald-400 transition-colors">Event Planning</button>
              <button onClick={() => onNavigate('committees')} className="text-right hover:text-emerald-400 transition-colors">Secretary</button>
              <button onClick={() => onNavigate('committees')} className="text-right hover:text-emerald-400 transition-colors">Charity &amp; Medical</button>
              <button onClick={() => onNavigate('committees')} className="text-right hover:text-emerald-400 transition-colors">Magic Hand Décor</button>
              <button onClick={() => onNavigate('committees')} className="text-right text-emerald-300 font-semibold hover:text-emerald-200 transition-colors">Data Analysis</button>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">التواصل والمقر</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>كلية الصيدلة، جامعة الدلتا للعلوم والتكنولوجيا، جمصة، الدقهلية</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>contact@aliens-space.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+20 101 234 5678 (PR Team)</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={onOpenRecruitment}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>فتح استمارة التقديم</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 ALIENS SPACE — All Rights Reserved. Built with precision for Delta University Pharmacy students.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Made with passion by</span>
            <span className="text-emerald-400 font-bold">Aliens Tech &amp; Data Team</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
