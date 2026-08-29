import React, { useState } from 'react';
import { 
  Home, 
  Info, 
  Users, 
  Calendar, 
  Image, 
  FolderGit2, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Award, 
  FileText, 
  CheckSquare, 
  LayoutDashboard, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  BarChart3, 
  HeartHandshake, 
  GraduationCap, 
  BookOpen, 
  History, 
  Settings, 
  Layers, 
  Ticket, 
  UserPlus, 
  Briefcase,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { Profile } from '../types';

interface SidebarProps {
  currentUser: Profile | null;
  currentRoute: string;
  currentSubRoute?: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, subRoute?: string) => void;
  onOpenRecruitment: () => void;
  onOpenAuth: () => void;
  onOpenAccessCode: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentRoute,
  currentSubRoute,
  isOpen,
  onClose,
  onNavigate,
  onOpenRecruitment,
  onOpenAuth,
  onOpenAccessCode,
  onOpenProfile,
  onLogout
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    public: true,
    member: true,
    committee: true,
    ir: true,
    leadership: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNavClick = (route: string, subRoute?: string) => {
    onNavigate(route, subRoute);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Role Checks
  const isOG = currentUser?.role === 'OG';
  const isTeamLeadership = ['OG', 'team_head', 'team_sub_head'].includes(currentUser?.role || '');
  const isIRLeadership = ['OG', 'ir_head', 'ir_sub_head'].includes(currentUser?.role || '');
  const isIREvaluator = currentUser?.is_evaluator || currentUser?.role === 'ir_evaluator' || isIRLeadership;
  const isCommitteeLeadership = ['head', 'sub_head', 'OG'].includes(currentUser?.role || '');
  const isTeamMember = currentUser && !['registered_user', 'guest'].includes(currentUser.role);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 right-0 z-40 flex flex-col bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/80 text-slate-200 transition-all duration-300 shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-sm tracking-wider">
                  AS
                </span>
              </div>
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="text-sm font-bold tracking-tight text-slate-100 block">ALIENS SPACE</span>
                <span className="text-[10px] text-emerald-400 font-mono tracking-widest block">DELTA PHARMACY</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
              title={collapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
            >
              {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Mini Profile / Quick State */}
        <div className="p-3 border-b border-slate-800/60 bg-slate-900/40 shrink-0">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <div 
                onClick={onOpenProfile}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer p-1.5 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentUser.full_name.charAt(0)
                  )}
                </div>
                {!collapsed && (
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-100 truncate">{currentUser.full_name}</p>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono">
                      {currentUser.role.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {!collapsed && (
                <button
                  onClick={onLogout}
                  title="تسجيل الخروج"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {!collapsed ? (
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول / عضو جديد</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  title="تسجيل الدخول"
                  className="w-full p-2 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation Sections (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* SECTION 1: PUBLIC NAVIGATION */}
          <div>
            {!collapsed && (
              <button 
                onClick={() => toggleSection('public')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2"
              >
                <span>القائمة العامة</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openSections.public ? '' : '-rotate-90'}`} />
              </button>
            )}

            {openSections.public && (
              <div className="space-y-1">
                <NavItem
                  icon={<Home className="w-4 h-4" />}
                  label="الرئيسية"
                  active={currentRoute === 'home'}
                  collapsed={collapsed}
                  onClick={() => handleNavClick('home')}
                />
                <NavItem
                  icon={<Info className="w-4 h-4" />}
                  label="عن الكيان والقيادة"
                  active={currentRoute === 'about'}
                  collapsed={collapsed}
                  onClick={() => handleNavClick('about')}
                />
                <NavItem
                  icon={<Layers className="w-4 h-4" />}
                  label="اللجان التسع (9)"
                  active={currentRoute === 'committees'}
                  collapsed={collapsed}
                  onClick={() => handleNavClick('committees')}
                />
                <NavItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="الفعاليات والمؤتمرات"
                  active={currentRoute === 'events'}
                  collapsed={collapsed}
                  onClick={() => handleNavClick('events')}
                />
                <NavItem
                  icon={<FolderGit2 className="w-4 h-4" />}
                  label="المشاريع والمقالات الطبية"
                  active={currentRoute === 'hub'}
                  collapsed={collapsed}
                  onClick={() => handleNavClick('hub')}
                />
                <NavItem
                  icon={<Image className="w-4 h-4" />}
                  label="معرض الصور والألبومات"
                  active={currentRoute === 'gallery'}
                  collapsed={collapsed}
                  onClick={() => handleNavClick('gallery')}
                />
                <NavItem
                  icon={<Sparkles className="w-4 h-4" />}
                  label="جدار الذكريات"
                  active={currentRoute === 'memories'}
                  collapsed={collapsed}
                  onClick={() => handleNavClick('memories')}
                />
                <NavItem
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label="التحقق من الشهادات"
                  active={currentRoute === 'verify'}
                  collapsed={collapsed}
                  onClick={() => handleNavClick('verify')}
                />
                <NavItem
                  icon={<UserPlus className="w-4 h-4 text-emerald-400" />}
                  label="استمارة التطوع (Recruitment)"
                  active={false}
                  collapsed={collapsed}
                  onClick={() => {
                    onOpenRecruitment();
                    if (window.innerWidth < 1024) onClose();
                  }}
                />
              </div>
            )}
          </div>

          {/* SECTION 2: AUTHENTICATED / MEMBER WORKSPACE */}
          {currentUser && (
            <div>
              {!collapsed && (
                <button 
                  onClick={() => toggleSection('member')}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2"
                >
                  <span>مساحتي الشخصية</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openSections.member ? '' : '-rotate-90'}`} />
                </button>
              )}

              {openSections.member && (
                <div className="space-y-1">
                  <NavItem
                    icon={<User className="w-4 h-4" />}
                    label="الملف الشخصي"
                    active={false}
                    collapsed={collapsed}
                    onClick={onOpenProfile}
                  />
                  <NavItem
                    icon={<Ticket className="w-4 h-4" />}
                    label="تذاكري وفعالياتي"
                    active={currentRoute === 'events' && currentSubRoute === 'my_tickets'}
                    collapsed={collapsed}
                    onClick={() => handleNavClick('events', 'my_tickets')}
                  />
                  {isTeamMember && (
                    <NavItem
                      icon={<CheckSquare className="w-4 h-4" />}
                      label="مهام لجنتي"
                      active={currentRoute === 'dashboard' && currentSubRoute === 'workspace'}
                      collapsed={collapsed}
                      onClick={() => handleNavClick('dashboard', 'workspace')}
                    />
                  )}
                  <NavItem
                    icon={<Key className="w-4 h-4 text-amber-400" />}
                    label="تفعيل كود ترقية"
                    active={false}
                    collapsed={collapsed}
                    onClick={onOpenAccessCode}
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: IR OPERATIONS (Gated to IR Evaluators & IR Leadership) */}
          {(isIREvaluator || isOG) && (
            <div>
              {!collapsed && (
                <button 
                  onClick={() => toggleSection('ir')}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-teal-400 uppercase tracking-wider mb-2 px-2"
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>عمليات الـ IR والتقييم</span>
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openSections.ir ? '' : '-rotate-90'}`} />
                </button>
              )}

              {openSections.ir && (
                <div className="space-y-1">
                  <NavItem
                    icon={<BarChart3 className="w-4 h-4 text-teal-400" />}
                    label="نظرة عامة على الـ IR"
                    active={currentRoute === 'dashboard' && currentSubRoute === 'ir_overview'}
                    collapsed={collapsed}
                    onClick={() => handleNavClick('dashboard', 'ir_overview')}
                  />
                  {isIRLeadership && (
                    <>
                      <NavItem
                        icon={<Users className="w-4 h-4 text-teal-400" />}
                        label="توزيع الأعضاء الحاليين (Member Dist.)"
                        active={currentRoute === 'dashboard' && currentSubRoute === 'ir_members'}
                        collapsed={collapsed}
                        onClick={() => handleNavClick('dashboard', 'ir_members')}
                      />
                      <NavItem
                        icon={<UserPlus className="w-4 h-4 text-teal-400" />}
                        label="المتقدمين الجدد (Applicants Dist.)"
                        active={currentRoute === 'dashboard' && currentSubRoute === 'ir_applicants'}
                        collapsed={collapsed}
                        onClick={() => handleNavClick('dashboard', 'ir_applicants')}
                      />
                    </>
                  )}
                  <NavItem
                    icon={<Award className="w-4 h-4 text-teal-400" />}
                    label="التقييم الشهري للأعضاء"
                    active={currentRoute === 'dashboard' && currentSubRoute === 'ir_evaluations'}
                    collapsed={collapsed}
                    onClick={() => handleNavClick('dashboard', 'ir_evaluations')}
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: COMMITTEE & LEADERSHIP WORKSPACE */}
          {(isCommitteeLeadership || isTeamLeadership) && (
            <div>
              {!collapsed && (
                <button 
                  onClick={() => toggleSection('leadership')}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 px-2"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>لوحة القيادة والإدارة</span>
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${openSections.leadership ? '' : '-rotate-90'}`} />
                </button>
              )}

              {openSections.leadership && (
                <div className="space-y-1">
                  <NavItem
                    icon={<LayoutDashboard className="w-4 h-4 text-amber-400" />}
                    label="مركز القيادة (Command Center)"
                    active={currentRoute === 'dashboard' && (!currentSubRoute || currentSubRoute === 'overview')}
                    collapsed={collapsed}
                    onClick={() => handleNavClick('dashboard', 'overview')}
                  />
                  <NavItem
                    icon={<CheckSquare className="w-4 h-4" />}
                    label="إدارة مهام اللجان"
                    active={currentRoute === 'dashboard' && currentSubRoute === 'workspace'}
                    collapsed={collapsed}
                    onClick={() => handleNavClick('dashboard', 'workspace')}
                  />
                  <NavItem
                    icon={<UserPlus className="w-4 h-4" />}
                    label="طلبات التقديم والتسكين"
                    active={currentRoute === 'dashboard' && currentSubRoute === 'recruitment'}
                    collapsed={collapsed}
                    onClick={() => handleNavClick('dashboard', 'recruitment')}
                  />
                  <NavItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="إدارة الفعاليات والحضور"
                    active={currentRoute === 'dashboard' && currentSubRoute === 'events'}
                    collapsed={collapsed}
                    onClick={() => handleNavClick('dashboard', 'events')}
                  />
                  <NavItem
                    icon={<Award className="w-4 h-4" />}
                    label="الشهادات المعتمدة"
                    active={currentRoute === 'dashboard' && currentSubRoute === 'certificates'}
                    collapsed={collapsed}
                    onClick={() => handleNavClick('dashboard', 'certificates')}
                  />
                  {isTeamLeadership && (
                    <>
                      <NavItem
                        icon={<Key className="w-4 h-4" />}
                        label="أكواد الترقية (Access Codes)"
                        active={currentRoute === 'dashboard' && currentSubRoute === 'codes'}
                        collapsed={collapsed}
                        onClick={() => handleNavClick('dashboard', 'codes')}
                      />
                      <NavItem
                        icon={<History className="w-4 h-4" />}
                        label="سجل الرقابة والأمان (Audit Logs)"
                        active={currentRoute === 'dashboard' && currentSubRoute === 'audit'}
                        collapsed={collapsed}
                        onClick={() => handleNavClick('dashboard', 'audit')}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer / Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0 text-center">
          {!collapsed ? (
            <p className="text-[10px] text-slate-500 font-mono">
              Aliens Space v2.4 • Delta Univ
            </p>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          )}
        </div>

      </aside>
    </>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  active,
  collapsed,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        active 
          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm' 
          : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
      } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
};
