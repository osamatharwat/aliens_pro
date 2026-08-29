import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Calendar, 
  Award, 
  Image, 
  BookOpen, 
  Heart, 
  LogIn, 
  LogOut, 
  User, 
  Key, 
  LayoutDashboard,
  ExternalLink,
  ChevronDown,
  Sidebar as SidebarIcon
} from 'lucide-react';
import { Profile } from '../types';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser: Profile | null;
  onOpenAuth: () => void;
  onOpenRecruitment: () => void;
  onOpenAccessCode: () => void;
  onOpenProfile: () => void;
  onToggleSidebar: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  onOpenAuth,
  onOpenRecruitment,
  onOpenAccessCode,
  onOpenProfile,
  onToggleSidebar,
  onSignOut
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Sparkles },
    { id: 'about', label: 'عن الكيان', icon: BookOpen },
    { id: 'committees', label: 'اللجان التسع', icon: Layers },
    { id: 'events', label: 'الفعاليات', icon: Calendar },
    { id: 'verify', label: 'فحص الشهادات', icon: ShieldCheck },
    { id: 'memories', label: 'جدار الذكريات', icon: Heart },
    { id: 'gallery', label: 'المعرض', icon: Image },
    { id: 'hub', label: 'المكتبة والتدريب', icon: ExternalLink },
  ];

  const isLeaderOrMember = currentUser && currentUser.role !== 'guest' && currentUser.role !== 'registered_user';

  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-emerald-950/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Sidebar Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              title="فتح القائمة الجانبية الكاملة"
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition-all flex items-center justify-center cursor-pointer"
            >
              <SidebarIcon className="w-5 h-5" />
            </button>

            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 group-hover:border-emerald-400 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 rounded-xl bg-emerald-400/10 blur-sm group-hover:blur-md transition-all opacity-0 group-hover:opacity-100" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-mono">
                    ALIENS
                  </span>
                  <span className="text-xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold">
                    SPACE
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">كلية الصيدلة — جامعة الدلتا</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & User State */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Recruitment CTA */}
            <button
              id="cta-join-recruitment"
              onClick={onOpenRecruitment}
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تقديم طلب انضمام</span>
            </button>

            {/* If Authenticated */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all text-xs cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold overflow-hidden">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-200 leading-none">{currentUser.full_name.split(' ')[0]}</p>
                    <p className="text-[10px] text-emerald-400 leading-none mt-0.5 capitalize">
                      {currentUser.role === 'OG' ? 'President (OG)' : currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800/80">
                      <p className="text-xs font-bold text-slate-200 truncate">{currentUser.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      {currentUser.committee_key && (
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded font-mono">
                          {currentUser.committee_position || 'Member'} — {currentUser.committee_key}
                        </span>
                      )}
                    </div>

                    <button
                      id="dropdown-profile-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors text-right cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>الملف الشخصي والتقييمات</span>
                    </button>

                    <button
                      id="dropdown-dashboard-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors text-right cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                      <span>{isLeaderOrMember ? 'غرفة العمليات الإدارية (IR & Teams)' : 'لوحة التحكم وحسابي'}</span>
                    </button>

                    <button
                      id="dropdown-redeem-code-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAccessCode();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors text-right cursor-pointer"
                    >
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>تفعيل كود ترقية لجنة</span>
                    </button>

                    <div className="border-t border-slate-800/80 mt-1 pt-1">
                      <button
                        id="dropdown-signout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-950/30 transition-colors text-right cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 hover:text-emerald-300 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تسجيل الدخول</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger & Sidebar Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300"
              title="القائمة الجانبية"
            >
              <SidebarIcon className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenRecruitment();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>تقديم طلب انضمام</span>
            </button>

            {currentUser ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold"
                >
                  الملف الشخصي
                </button>
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold"
                >
                  غرفة العمليات
                </button>
                <button
                  onClick={() => {
                    onSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 rounded-lg bg-red-950/60 text-red-400 border border-red-900 text-xs font-semibold"
                >
                  خروج
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
