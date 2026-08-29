import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Layers, 
  Calendar, 
  Award, 
  Key, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  Check,
  AlertCircle,
  UserCheck,
  UserPlus,
  ArrowRightLeft,
  UserMinus,
  Sliders,
  History,
  TrendingUp,
  Briefcase,
  Eye,
  CheckSquare
} from 'lucide-react';
import { 
  Profile, 
  Committee, 
  CommitteeKey, 
  ApplicationItem, 
  EventItem, 
  EventRegistration, 
  CertificateItem, 
  AccessCodeItem, 
  AuditLogItem, 
  CommitteeTask,
  IRAssignment,
  EvaluationItem
} from '../../types';
import { ApiService } from '../../services/api';
import { irService, EvaluatorWithLoad } from '../../services/irService';
import { evaluationService } from '../../services/evaluationService';
import { profileService } from '../../services/profileService';

interface DashboardCommandCenterProps {
  currentUser: Profile;
  initialTab?: string;
  onOpenCertificate: (cert: CertificateItem) => void;
  onNavigateHome: () => void;
}

export const DashboardCommandCenter: React.FC<DashboardCommandCenterProps> = ({
  currentUser,
  initialTab = 'overview',
  onOpenCertificate,
  onNavigateHome
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'ir_members' | 'ir_applicants' | 'ir_evaluations' | 'workspace' | 'recruitment' | 'events' | 'certificates' | 'codes' | 'audit'
  >((initialTab as any) || 'overview');

  // Core Data States
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCodeItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [tasks, setTasks] = useState<CommitteeTask[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);

  // IR States
  const [evaluators, setEvaluators] = useState<EvaluatorWithLoad[]>([]);
  const [unassignedMembers, setUnassignedMembers] = useState<Profile[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<IRAssignment[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<IRAssignment[]>([]);
  const [irMemberFilterComm, setIrMemberFilterComm] = useState<string>('all');
  const [irMemberSearch, setIrMemberSearch] = useState<string>('');

  // Applicant Review / Interview Modal State
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [applicantReviewMode, setApplicantReviewMode] = useState<'view' | 'interview'>('view');
  const [appIRDecision, setAppIRDecision] = useState<'pending' | 'accepted' | 'rejected' | 'shift_recommended'>('accepted');
  const [appIRNotes, setAppIRNotes] = useState<string>('');
  const [appShiftComm, setAppShiftComm] = useState<CommitteeKey>('pr');
  const [appAssignTargetEvaluator, setAppAssignTargetEvaluator] = useState<string>('');

  // Monthly Evaluation Form State
  const [evalMemberId, setEvalMemberId] = useState<string>('');
  const [evalMonth, setEvalMonth] = useState<string>('2026-08');
  const [evalCommitment, setEvalCommitment] = useState<number>(24);
  const [evalCommunication, setEvalCommunication] = useState<number>(23);
  const [evalTaskQuality, setEvalTaskQuality] = useState<number>(24);
  const [evalInitiative, setEvalInitiative] = useState<number>(22);
  const [evalNotes, setEvalNotes] = useState<string>('');
  const [evalMessage, setEvalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected committee for Workspace tab
  const defaultComm = currentUser.committee_key || 'marketing';
  const [selectedWorkspaceComm, setSelectedWorkspaceComm] = useState<CommitteeKey>(defaultComm);

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  
  // New Code Form
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeRole, setNewCodeRole] = useState<'member' | 'head' | 'sub_head' | 'ir_evaluator' | 'OG'>('member');
  const [newCodeComm, setNewCodeComm] = useState<CommitteeKey>('marketing');
  const [newCodeUses, setNewCodeUses] = useState(5);

  // New Event Form
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evLocation, setEvLocation] = useState('قاعة المؤتمرات — كلية الصيدلة');
  const [evCapacity, setEvCapacity] = useState(250);
  const [evCategory, setEvCategory] = useState<'technical' | 'clinical' | 'soft_skills' | 'workshop' | 'hackathon'>('workshop');
  const [evDesc, setEvDesc] = useState('');

  // Selected event for attendance management
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Permission flags
  const isOG = currentUser.role === 'OG';
  const isTeamLeadership = ['OG', 'team_head', 'team_sub_head'].includes(currentUser.role);
  const isIRLeadership = ['OG', 'ir_head', 'ir_sub_head'].includes(currentUser.role);
  const isIREvaluator = currentUser.is_evaluator || currentUser.role === 'ir_evaluator' || isIRLeadership;
  const isCommitteeLeadership = ['head', 'sub_head', 'OG'].includes(currentUser.role);

  const loadAllData = async () => {
    try {
      const [c, app, ev, reg, cert, codes, logs, tks, profs, evs, unassigned, asgs, hist] = await Promise.all([
        ApiService.getAllCommittees(),
        ApiService.getApplications(),
        ApiService.getEvents(),
        ApiService.getRegistrations(),
        ApiService.getAllCertificates(),
        ApiService.getAccessCodes(),
        ApiService.getAuditLogs(),
        ApiService.getTasks(),
        profileService.getAllProfiles(),
        evaluationService.getAllEvaluations(currentUser),
        irService.getUnassignedMembers(),
        irService.getActiveAssignments(),
        irService.getAssignmentHistory()
      ]);

      const evalList = await irService.getEligibleEvaluators();

      setCommittees(c);
      setApplications(app);
      setEvents(ev);
      setRegistrations(reg);
      setCertificates(cert);
      setAccessCodes(codes);
      setAuditLogs(logs);
      setTasks(tks);
      setProfiles(profs);
      setEvaluations(evs);
      setEvaluators(evalList);
      setUnassignedMembers(unassigned);
      setActiveAssignments(asgs);
      setAssignmentHistory(hist);

      if (ev.length > 0 && !selectedEventId) {
        setSelectedEventId(ev[0].id);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Filtered registrations for selected event
  const eventRegistrations = registrations.filter(r => r.event_id === selectedEventId);

  // ==========================================
  // IR WORKFLOW A: MEMBER ASSIGNMENT HANDLERS
  // ==========================================
  const handleAssignMember = async (memberId: string, evaluatorId: string) => {
    try {
      await irService.assignMember(memberId, evaluatorId, currentUser);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل تعيين المقيّم.');
    }
  };

  const handleUnassignMember = async (memberId: string) => {
    try {
      await irService.unassignMember(memberId, currentUser);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل إلغاء التعيين.');
    }
  };

  // ==========================================
  // IR WORKFLOW B: APPLICANT REVIEW HANDLERS
  // ==========================================
  const handleAssignApplicant = async (appId: string, evaluatorId: string) => {
    try {
      await irService.assignApplicant(appId, evaluatorId, currentUser);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل تعيين المتقدم للمقيّم.');
    }
  };

  const handleUnassignApplicant = async (appId: string) => {
    try {
      await irService.unassignApplicant(appId, currentUser);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل إلغاء التعيين.');
    }
  };

  const handleSubmitApplicantReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await irService.submitApplicantReview(
        selectedApp.id,
        {
          ir_status: appIRDecision,
          ir_notes: appIRNotes,
          shift_to_committee: appIRDecision === 'shift_recommended' ? appShiftComm : undefined
        },
        currentUser
      );
      setSelectedApp(null);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل حفظ تقييم المتقدم.');
    }
  };

  // ==========================================
  // IR MONTHLY EVALUATION HANDLER
  // ==========================================
  const totalScore = Math.min(100, Math.max(0, evalCommitment + evalCommunication + evalTaskQuality + evalInitiative));

  const handleSubmitMonthlyEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvalMessage(null);

    if (!evalMemberId) {
      setEvalMessage({ type: 'error', text: 'يرجى اختيار العضو المراد تقييمه.' });
      return;
    }

    try {
      await evaluationService.submitMonthlyEvaluation(
        {
          member_id: evalMemberId,
          evaluation_month: evalMonth,
          score: totalScore,
          criteria_scores: {
            commitment: evalCommitment,
            communication: evalCommunication,
            task_quality: evalTaskQuality,
            initiative: evalInitiative
          },
          notes: evalNotes
        },
        currentUser
      );

      setEvalMessage({ type: 'success', text: `تم حفظ تقييم شهر (${evalMonth}) بنتيجة ${totalScore}/100 بنجاح!` });
      setEvalNotes('');
      await loadAllData();
    } catch (err: any) {
      setEvalMessage({ type: 'error', text: err.message || 'فشل تسجيل التقييم.' });
    }
  };

  // Attendance & Tasks Handlers
  const handleMarkAttendance = async (regId: string, status: 'attended' | 'not_completed') => {
    await ApiService.updateAttendance(regId, status, currentUser);
    await loadAllData();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await ApiService.createTask({
      committee_key: selectedWorkspaceComm,
      title: newTaskTitle.trim(),
      assigned_to_name: newTaskAssignee.trim() || 'جميع الأعضاء',
      status: 'todo',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    }, currentUser);
    setNewTaskTitle('');
    setNewTaskAssignee('');
    await loadAllData();
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    await ApiService.updateTaskStatus(taskId, nextStatus as any, currentUser);
    await loadAllData();
  };

  const handleCreateAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName.trim()) return;
    await ApiService.createAccessCode({
      code: newCodeName.trim().toUpperCase(),
      target_role: newCodeRole,
      committee_key: newCodeComm,
      committee_position: newCodeRole === 'head' ? 'Head' : newCodeRole === 'sub_head' ? 'Sub Head' : 'Member',
      max_uses: newCodeUses,
      is_active: true
    }, currentUser);
    setNewCodeName('');
    await loadAllData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim() || !evDate) return;
    await ApiService.createEvent({
      title: evTitle.trim(),
      description: evDesc.trim(),
      event_date: evDate,
      location: evLocation,
      capacity: evCapacity,
      registration_open: true,
      category: evCategory,
      certificate_enabled: true,
      is_public: true,
      is_published: true
    }, currentUser);
    setShowNewEventModal(false);
    setEvTitle('');
    setEvDesc('');
    await loadAllData();
  };

  // Evaluator view members list
  const evaluatorAssignedMembers = isIRLeadership 
    ? profiles.filter(p => !['registered_user', 'guest'].includes(p.role))
    : profiles.filter(p => p.assigned_ir === currentUser.id);

  // Evaluator view applicants list
  const evaluatorAssignedApplicants = isIRLeadership
    ? applications
    : applications.filter(a => a.ir_assignee_id === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold font-mono">
              ROLE: {currentUser.role.toUpperCase()}
            </span>
            {currentUser.committee_key && (
              <span className="text-xs px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700 text-teal-300 font-semibold">
                لجنة {currentUser.committee_key}
              </span>
            )}
            {currentUser.is_evaluator && (
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700 text-cyan-300 font-semibold">
                مقيّم أداء معتمد (IR Evaluator)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
            غرفة العمليات المركزية والـ IR
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            إدارة توزيع المقيمين، مقابلات المتقدمين، التقييم الشهري، مهام اللجان، وسجلات الحضور والشهادات.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={onNavigateHome}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            العودة للرئيسية
          </button>
          
          {(isIRLeadership || isOG) && (
            <button
              onClick={() => setActiveTab('ir_members')}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>توزيع الأعضاء (IR)</span>
            </button>
          )}

          <button
            onClick={() => setShowNewEventModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إنشاء مؤتمر / فعالية</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          icon={<BarChart3 className="w-4 h-4" />}
          label="نظرة عامة"
        />

        {(isIRLeadership || isOG) && (
          <TabButton
            active={activeTab === 'ir_members'}
            onClick={() => setActiveTab('ir_members')}
            icon={<Users className="w-4 h-4 text-teal-400" />}
            label={`توزيع الأعضاء (${unassignedMembers.length} غير مسكن)`}
            badgeColor="bg-teal-950 text-teal-300 border-teal-800"
          />
        )}

        {(isIREvaluator || isOG) && (
          <TabButton
            active={activeTab === 'ir_applicants'}
            onClick={() => setActiveTab('ir_applicants')}
            icon={<UserPlus className="w-4 h-4 text-cyan-400" />}
            label={`مقابلات المتقدمين (${evaluatorAssignedApplicants.length})`}
            badgeColor="bg-cyan-950 text-cyan-300 border-cyan-800"
          />
        )}

        {(isIREvaluator || isOG) && (
          <TabButton
            active={activeTab === 'ir_evaluations'}
            onClick={() => setActiveTab('ir_evaluations')}
            icon={<Award className="w-4 h-4 text-emerald-400" />}
            label="التقييم الشهري للأداء"
          />
        )}

        <TabButton
          active={activeTab === 'workspace'}
          onClick={() => setActiveTab('workspace')}
          icon={<CheckSquare className="w-4 h-4" />}
          label={`مهام اللجان (${tasks.length})`}
        />

        <TabButton
          active={activeTab === 'recruitment'}
          onClick={() => setActiveTab('recruitment')}
          icon={<FileText className="w-4 h-4" />}
          label={`طلبات التسكين (${applications.length})`}
        />

        <TabButton
          active={activeTab === 'events'}
          onClick={() => setActiveTab('events')}
          icon={<Calendar className="w-4 h-4" />}
          label={`الفعاليات والحضور (${events.length})`}
        />

        <TabButton
          active={activeTab === 'certificates'}
          onClick={() => setActiveTab('certificates')}
          icon={<ShieldCheck className="w-4 h-4" />}
          label={`الشهادات (${certificates.length})`}
        />

        {isTeamLeadership && (
          <>
            <TabButton
              active={activeTab === 'codes'}
              onClick={() => setActiveTab('codes')}
              icon={<Key className="w-4 h-4" />}
              label="أكواد الترقية"
            />
            <TabButton
              active={activeTab === 'audit'}
              onClick={() => setActiveTab('audit')}
              icon={<History className="w-4 h-4" />}
              label="سجل الرقابة"
            />
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<Users className="w-5 h-5 text-emerald-400" />}
              title="إجمالي الأعضاء والمقيّمين"
              value={profiles.filter(p => !['registered_user', 'guest'].includes(p.role)).length}
              subtext={`${evaluators.length} مقيّم معتمد`}
            />
            <MetricCard
              icon={<UserPlus className="w-5 h-5 text-teal-400" />}
              title="طلبات التقديم الجديدة"
              value={applications.length}
              subtext={`${applications.filter(a => a.ir_status === 'pending').length} في انتظار مقابلة الـ IR`}
            />
            <MetricCard
              icon={<Calendar className="w-5 h-5 text-cyan-400" />}
              title="المسجلين بالفعاليات"
              value={registrations.length}
              subtext={`${registrations.filter(r => r.attendance_status === 'attended').length} مؤكد حضورهم`}
            />
            <MetricCard
              icon={<Award className="w-5 h-5 text-amber-400" />}
              title="الشهادات المعتمدة"
              value={certificates.length}
              subtext="موثقة إلكترونياً بـ QR"
            />
          </div>

          {/* IR Operations Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-100">حالة حمل المقيّمين (IR Evaluators Load)</h3>
                </div>
                <span className="text-xs text-slate-400">الحد الأقصى لكل مقيّم: {irService.MAX_LOAD_PER_EVALUATOR} عضو</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {evaluators.slice(0, 6).map(ev => {
                  const percentage = Math.round((ev.current_load / irService.MAX_LOAD_PER_EVALUATOR) * 100);
                  return (
                    <div key={ev.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-200">{ev.full_name}</p>
                          <span className="text-[10px] text-teal-400 font-mono">{ev.role.toUpperCase()}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {ev.current_load} / {irService.MAX_LOAD_PER_EVALUATOR}
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>المتبقي: {ev.remaining_capacity} مكان</span>
                        <span>{percentage}% مشتغل</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">إجراءات سريعة</h3>
              </div>

              <div className="space-y-2.5">
                {(isIRLeadership || isOG) && (
                  <button
                    onClick={() => setActiveTab('ir_members')}
                    className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-400" />
                      <span>تسكين الأعضاء غير الموزعين</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300 font-mono text-[10px]">
                      {unassignedMembers.length}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('ir_applicants')}
                  className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-cyan-400" />
                    <span>بدء مقابلات المتقدمين الجدد</span>
                  </span>
                  <ChevronLeftIcon className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveTab('ir_evaluations')}
                  className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>تسجيل التقييم الشهري للأعضاء</span>
                  </span>
                  <ChevronLeftIcon className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IR WORKFLOW A - CURRENT TEAM MEMBERS DISTRIBUTION */}
      {/* ========================================================================= */}
      {activeTab === 'ir_members' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  <span>توزيع الأعضاء الحاليين على مقيّمي الـ IR</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  توزيع أعضاء اللجان على مقيمي الـ IR المعتمدين مع الالتزام بالحد الأقصى ({irService.MAX_LOAD_PER_EVALUATOR} عضو لكل مقيّم).
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={irMemberSearch}
                    onChange={e => setIrMemberSearch(e.target.value)}
                    placeholder="بحث باسم العضو..."
                    className="pl-3 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-teal-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  value={irMemberFilterComm}
                  onChange={e => setIrMemberFilterComm(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-teal-500"
                >
                  <option value="all">كل اللجان</option>
                  {committees.map(c => (
                    <option key={c.key} value={c.key}>{c.arabic_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Evaluators Capacity Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {evaluators.map(ev => (
                <div 
                  key={ev.id} 
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 truncate">{ev.full_name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      ev.remaining_capacity === 0 
                        ? 'bg-red-950 text-red-300 border border-red-800' 
                        : 'bg-teal-950 text-teal-300 border border-teal-800'
                    }`}>
                      {ev.current_load} / {irService.MAX_LOAD_PER_EVALUATOR}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>السعة المتبقية: {ev.remaining_capacity}</span>
                    <span>{ev.committee_key ? `لجنة: ${ev.committee_key}` : 'IR Core'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members Table (Assigned & Unassigned) */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">
              قائمة أعضاء الكيان وحالة التعيين
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 px-3">العضو</th>
                    <th className="pb-3 px-3">اللجنة والمنصب</th>
                    <th className="pb-3 px-3">المقيّم الحالي</th>
                    <th className="pb-3 px-3">إجراءات التعيين</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profiles
                    .filter(p => !['registered_user', 'guest'].includes(p.role) && p.role !== 'OG')
                    .filter(p => irMemberFilterComm === 'all' || p.committee_key === irMemberFilterComm)
                    .filter(p => !irMemberSearch || p.full_name.toLowerCase().includes(irMemberSearch.toLowerCase()))
                    .map(member => {
                      const currentAssignment = activeAssignments.find(a => a.member_id === member.id);
                      const currentEvaluator = evaluators.find(e => e.id === currentAssignment?.evaluator_id || e.id === member.assigned_ir);

                      return (
                        <tr key={member.id} className="hover:bg-slate-950/40">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-200">{member.full_name}</div>
                            <span className="text-[10px] text-slate-500">{member.email}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                              {member.committee_key || 'غير محدد'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {currentEvaluator ? (
                              <span className="px-2.5 py-1 rounded-lg bg-teal-950/80 border border-teal-800 text-teal-300 font-semibold inline-flex items-center gap-1.5">
                                <UserCheck className="w-3 h-3 text-teal-400" />
                                <span>{currentEvaluator.full_name}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 font-semibold inline-flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3 text-amber-400" />
                                <span>غير معيّن</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {/* Assign / Reassign Dropdown */}
                              <select
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignMember(member.id, e.target.value);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-teal-500"
                              >
                                <option value="" disabled>
                                  {currentEvaluator ? 'إعادة تعيين إلى...' : 'تعيين مقيّم...'}
                                </option>
                                {evaluators.map(ev => (
                                  <option 
                                    key={ev.id} 
                                    value={ev.id}
                                    disabled={ev.remaining_capacity === 0 && ev.id !== currentEvaluator?.id}
                                  >
                                    {ev.full_name} ({ev.current_load}/{irService.MAX_LOAD_PER_EVALUATOR})
                                  </option>
                                ))}
                              </select>

                              {currentEvaluator && (
                                <button
                                  onClick={() => handleUnassignMember(member.id)}
                                  title="إلغاء التعيين"
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: IR WORKFLOW B - NEW RECRUITMENT APPLICANTS DISTRIBUTION & INTERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'ir_applicants' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                  <span>توزيع ومقابلات المتقدمين الجدد (Applicants IR Review)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  مراجعة استمارات المتقدمين، إجراء المقابلة الشخصية للـ IR، وتحديد القرار والتوصية.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 px-3">المتقدم</th>
                    <th className="pb-3 px-3">اللجنة المطلوبة</th>
                    <th className="pb-3 px-3">مقيّم الـ IR</th>
                    <th className="pb-3 px-3">قرار الـ IR</th>
                    <th className="pb-3 px-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {evaluatorAssignedApplicants.map(app => {
                    const assignedEvaluator = evaluators.find(e => e.id === app.ir_assignee_id);

                    return (
                      <tr key={app.id} className="hover:bg-slate-950/40">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-200">{app.applicant_name}</div>
                          <span className="text-[10px] text-slate-500">{app.phone} • {app.faculty_level}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                            {app.committee_name || app.committee_key}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {isIRLeadership ? (
                            <select
                              value={app.ir_assignee_id || ''}
                              onChange={(e) => {
                                if (e.target.value) handleAssignApplicant(app.id, e.target.value);
                                else handleUnassignApplicant(app.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-cyan-500"
                            >
                              <option value="">غير معيّن</option>
                              {evaluators.map(ev => (
                                <option key={ev.id} value={ev.id}>{ev.full_name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-slate-300">
                              {assignedEvaluator?.full_name || 'غير معيّن'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            app.ir_status === 'accepted' ? 'bg-emerald-950 border border-emerald-800 text-emerald-300' :
                            app.ir_status === 'rejected' ? 'bg-red-950 border border-red-800 text-red-300' :
                            'bg-amber-950 border border-amber-800 text-amber-300'
                          }`}>
                            {app.ir_status === 'accepted' ? 'موصى به (قبول)' :
                             app.ir_status === 'rejected' ? 'مرفوض IR' : 'في الانتظار'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setApplicantReviewMode('interview');
                              setAppIRDecision(app.ir_status === 'rejected' ? 'rejected' : 'accepted');
                              setAppIRNotes(app.ir_notes || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>المقابلة والاستمارة</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: IR MONTHLY EVALUATION WORKFLOW */}
      {/* ========================================================================= */}
      {activeTab === 'ir_evaluations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Evaluation Form */}
          <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100">تسجيل التقييم الشهري</h2>
            </div>
            <p className="text-xs text-slate-400">
              تقييم أداء العضو عبر المعايير الأربعة الأساسية (المجموع من 100).
            </p>

            {evalMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                evalMessage.type === 'success' ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-red-950/80 border border-red-800 text-red-300'
              }`}>
                {evalMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                <span>{evalMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitMonthlyEvaluation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اختيار العضو *
                </label>
                <select
                  required
                  value={evalMemberId}
                  onChange={e => setEvalMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500"
                >
                  <option value="">-- اختر العضو المقيّم --</option>
                  {evaluatorAssignedMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.committee_key || 'عام'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  شهر التقييم *
                </label>
                <select
                  value={evalMonth}
                  onChange={e => setEvalMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500"
                >
                  <option value="2026-08">أغسطس 2026</option>
                  <option value="2026-09">سبتمبر 2026</option>
                  <option value="2026-10">أكتوبر 2026</option>
                </select>
              </div>

              {/* Sliders for Criteria */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <CriteriaSlider
                  label="الالتزام والحضور (Commitment)"
                  value={evalCommitment}
                  max={25}
                  onChange={setEvalCommitment}
                />
                <CriteriaSlider
                  label="التواصل والعمل الجماعي (Communication)"
                  value={evalCommunication}
                  max={25}
                  onChange={setEvalCommunication}
                />
                <CriteriaSlider
                  label="جودة تنفيذ المهام (Task Quality)"
                  value={evalTaskQuality}
                  max={25}
                  onChange={setEvalTaskQuality}
                />
                <CriteriaSlider
                  label="المبادرة والإبداع (Initiative)"
                  value={evalInitiative}
                  max={25}
                  onChange={setEvalInitiative}
                />

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">الدرجة الكلية:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {totalScore} / 100
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ملاحظات وتوصيات للمطور/العضو
                </label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={e => setEvalNotes(e.target.value)}
                  placeholder="أداء متميز وتفاعل إيجابي مع باقي أفراد الفريق..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ التقييم الشهري المعتمد</span>
              </button>
            </form>
          </div>

          {/* Evaluations History Table */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-100">سجل التقييمات الشهرية المعتمدة</h3>
              <span className="text-xs text-slate-400">{evaluations.length} تقييم مسجل</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 px-3">العضو</th>
                    <th className="pb-3 px-3">الشهر</th>
                    <th className="pb-3 px-3">المقيّم</th>
                    <th className="pb-3 px-3">الدرجة الكلية</th>
                    <th className="pb-3 px-3">الملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {evaluations.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">{ev.member_name}</div>
                        <span className="text-[10px] text-slate-500">{ev.member_committee}</span>
                      </td>
                      <td className="py-3 px-3 font-mono">{ev.evaluation_month}</td>
                      <td className="py-3 px-3 text-slate-300">{ev.evaluator_name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold font-mono">
                          {ev.score} / 100
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 max-w-xs truncate">
                        {ev.notes || 'لا توجد ملاحظات إضافية'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: WORKSPACE / TASKS */}
      {/* ========================================================================= */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">تصفية حسب اللجنة:</span>
              <div className="flex flex-wrap gap-1.5">
                {committees.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setSelectedWorkspaceComm(c.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedWorkspaceComm === c.key
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c.arabic_name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Task Form */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>إضافة مهمة جديدة للجنة</span>
              </h3>

              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">عنوان المهمة *</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="مثال: إعداد بوستات المؤتمر السنوي"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">المكلف بالمهمة (اختياري)</label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    placeholder="اسم العضو أو 'جميع أفراد اللجنة'"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر المهمة</span>
                </button>
              </form>
            </div>

            {/* Tasks List */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">قائمة المهام النشطة</h3>
              
              <div className="space-y-2">
                {tasks
                  .filter(t => t.committee_key === selectedWorkspaceComm)
                  .map(task => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            task.status === 'completed'
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-700 hover:border-emerald-400'
                          }`}
                        >
                          {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div>
                          <p className={`text-xs font-bold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </p>
                          <span className="text-[10px] text-slate-400">المكلف: {task.assigned_to_name}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono ${
                        task.status === 'completed' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {task.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: RECRUITMENT APPLICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'recruitment' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100">طلبات التقديم والتسكين العام</h3>
            <span className="text-xs text-slate-400">{applications.length} متقدم</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 px-3">الاسم</th>
                  <th className="pb-3 px-3">اللجنة</th>
                  <th className="pb-3 px-3">رقم الهاتف</th>
                  <th className="pb-3 px-3">حالة الـ IR</th>
                  <th className="pb-3 px-3">قرار القيادة</th>
                  <th className="pb-3 px-3">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3 font-bold text-slate-200">{app.applicant_name}</td>
                    <td className="py-3 px-3 text-slate-300">{app.committee_name || app.committee_key}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{app.phone}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        app.ir_status === 'accepted' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {app.ir_status || 'معلق'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        app.status === 'accepted' ? 'bg-emerald-950 text-emerald-300' :
                        app.status === 'rejected' ? 'bg-red-950 text-red-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setApplicantReviewMode('view');
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                      >
                        عرض الاستمارة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: EVENTS & ATTENDANCE */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">إدارة الحضور وتأكيد الشهادات للفعالية</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تعليم الحضور بـ (Attended) يفعّل تلقائياً استخراج شهادة الإتمام المعتمدة للمشارك.
                </p>
              </div>

              <select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 px-3">اسم المشارك</th>
                    <th className="pb-3 px-3">كود التذكرة</th>
                    <th className="pb-3 px-3">رقم الهاتف</th>
                    <th className="pb-3 px-3">حالة الحضور الحالية</th>
                    <th className="pb-3 px-3">تحديث الحضور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {eventRegistrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-3 font-bold text-slate-200">{reg.registrant_name}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400">{reg.ticket_code}</td>
                      <td className="py-3 px-3 text-slate-400">{reg.registrant_phone}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          reg.attendance_status === 'attended'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {reg.attendance_status === 'attended' ? 'حاضر (مؤهل للشهادة)' : 'غير حاضر / مسجل'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMarkAttendance(reg.id, 'attended')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs"
                          >
                            تأكيد الحضور
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(reg.id, 'not_completed')}
                            className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-800/40 font-semibold text-xs"
                          >
                            لم يحضر
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: CERTIFICATES */}
      {/* ========================================================================= */}
      {activeTab === 'certificates' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100">سجل الشهادات الصادرة رسمياً</h3>
            <span className="text-xs text-slate-400">{certificates.length} شهادة مصدرة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map(cert => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 block w-fit mb-2">
                    {cert.verification_code}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{cert.recipient_name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{cert.event_title}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">{cert.event_date}</span>
                  <button
                    onClick={() => onOpenCertificate(cert)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض الشهادة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: ACCESS CODES (LEADERSHIP) */}
      {/* ========================================================================= */}
      {activeTab === 'codes' && isTeamLeadership && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>إصدار كود ترقية جديد</span>
            </h3>

            <form onSubmit={handleCreateAccessCode} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">كود الترقية *</label>
                <input
                  type="text"
                  required
                  value={newCodeName}
                  onChange={e => setNewCodeName(e.target.value)}
                  placeholder="مثال: ALIENS-IR-2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono uppercase text-amber-400 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">الرتبة المستهدفة</label>
                <select
                  value={newCodeRole}
                  onChange={e => setNewCodeRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500"
                >
                  <option value="member">عضو لجنة (Member)</option>
                  <option value="head">رئيس لجنة (Head)</option>
                  <option value="sub_head">نائب رئيس لجنة (Sub Head)</option>
                  <option value="ir_evaluator">مقيّم أداء (IR Evaluator)</option>
                  {isOG && <option value="OG">مؤسس / قيادة عليا (OG)</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">اللجنة</label>
                <select
                  value={newCodeComm}
                  onChange={e => setNewCodeComm(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500"
                >
                  {committees.map(c => (
                    <option key={c.key} value={c.key}>{c.arabic_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">عدد مرات الاستخدام</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newCodeUses}
                  onChange={e => setNewCodeUses(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>إصدار الكود</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100">الأكواد الفعالة</h3>
            
            <div className="space-y-2">
              {accessCodes.map(code => (
                <div
                  key={code.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 block">{code.code}</span>
                    <span className="text-[11px] text-slate-400">
                      الرتبة: {code.target_role} • اللجنة: {code.committee_key}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    {code.current_uses} / {code.max_uses} مستخدم
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && isTeamLeadership && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100">سجل النشاطات الإدارية والأمنية</h3>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 ml-2">
                    {log.action}
                  </span>
                  <span className="text-slate-200">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.created_at).toLocaleTimeString('ar-EG')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APPLICANT REVIEW & INTERVIEW MODAL */}
      {/* ========================================================================= */}
      {selectedApp && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedApp(null);
          }}
        >
          <div 
            className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{selectedApp.applicant_name}</h3>
                <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                  طلب انضمام للجنة: {selectedApp.committee_name || selectedApp.committee_key}
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                ✕
              </button>
            </div>

            {/* Applicant Details & Dynamic Answers */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">رقم الهاتف</span>
                  <span className="text-slate-200 font-mono">{selectedApp.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">الفرقة الدراسية</span>
                  <span className="text-slate-200">{selectedApp.faculty_level}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">تاريخ التقديم</span>
                  <span className="text-slate-200 font-mono">
                    {new Date(selectedApp.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>

              {/* Dynamic Questions Answers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300">إجابات أسئلة استمارة اللجنة:</h4>
                <div className="space-y-2">
                  {selectedApp.question_snapshots?.map((q, idx) => (
                    <div key={q.id || idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <p className="text-xs font-bold text-slate-300">{q.question_text}</p>
                      <p className="text-xs text-emerald-300 leading-relaxed">
                        {selectedApp.dynamic_answers[q.id] || selectedApp.dynamic_answers[idx.toString()] || 'لا توجد إجابة مسجلة'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* IR Interview / Evaluation Form */}
              <form onSubmit={handleSubmitApplicantReview} className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200">تقييم وملاحظات الـ IR</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      قرار الـ IR النهائي للمتقدم *
                    </label>
                    <select
                      value={appIRDecision}
                      onChange={e => setAppIRDecision(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
                    >
                      <option value="accepted">قبول مبدئي (موصى به للجنة)</option>
                      <option value="rejected">رفض من الـ IR</option>
                      <option value="shift_recommended">تحويل إلى لجنة أخرى مناسبة (Shift)</option>
                      <option value="pending">في انتظار استكمال المقابلة</option>
                    </select>
                  </div>

                  {appIRDecision === 'shift_recommended' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        اللجنة الموصى بالتحويل إليها *
                      </label>
                      <select
                        value={appShiftComm}
                        onChange={e => setAppShiftComm(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
                      >
                        {committees.map(c => (
                          <option key={c.key} value={c.key}>{c.arabic_name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ملاحظات المقابلة الشخصية (Interview Notes)
                  </label>
                  <textarea
                    rows={3}
                    value={appIRNotes}
                    onChange={e => setAppIRNotes(e.target.value)}
                    placeholder="نقاط القوة، الالتزام، مستوى مهارات التواصل، وملاحظات المقيّم..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    إغلاق
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ قرار الـ IR</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">إضافة مؤتمر أو فعالية جديدة</h3>
              <button onClick={() => setShowNewEventModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">عنوان الفعالية *</label>
                <input
                  type="text"
                  required
                  value={evTitle}
                  onChange={e => setEvTitle(e.target.value)}
                  placeholder="مثال: مؤتمر الدلتا للذكاء الاصطناعي في الصيدلة"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">التاريخ والوقت *</label>
                <input
                  type="datetime-local"
                  required
                  value={evDate}
                  onChange={e => setEvDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">مكان الفعالية</label>
                <input
                  type="text"
                  value={evLocation}
                  onChange={e => setEvLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">السعة الاستيعابية</label>
                <input
                  type="number"
                  value={evCapacity}
                  onChange={e => setEvCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={evDesc}
                  onChange={e => setEvDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                >
                  نشر الفعالية وتفعيل الشهادات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badgeColor?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, badgeColor }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
        active
          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
          : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtext: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, subtext }) => {
  return (
    <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">{icon}</div>
      </div>
      <p className="text-2xl font-black text-slate-100 font-mono">{value}</p>
      <p className="text-[11px] text-slate-500">{subtext}</p>
    </div>
  );
};

interface CriteriaSliderProps {
  label: string;
  value: number;
  max: number;
  onChange: (val: number) => void;
}

const CriteriaSlider: React.FC<CriteriaSliderProps> = ({ label, value, max, onChange }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="font-mono font-bold text-emerald-400">{value} / {max}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
};

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
