import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Ticket, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  ExternalLink,
  Search
} from 'lucide-react';
import { EventItem, EventRegistration, Profile, CertificateItem } from '../../types';
import { ApiService } from '../../services/api';

interface EventsViewProps {
  currentUser: Profile | null;
  onOpenTicket: (reg: EventRegistration, event: EventItem) => void;
  onOpenCertificate: (cert: CertificateItem) => void;
  onOpenAuth: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  currentUser,
  onOpenTicket,
  onOpenCertificate,
  onOpenAuth
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'my_tickets'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Register Modal State
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);
  const [regName, setRegName] = useState(currentUser?.full_name || '');
  const [regPhone, setRegPhone] = useState(currentUser?.phone || '');
  const [regEmail, setRegEmail] = useState(currentUser?.email || '');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const loadData = async () => {
    const evs = await ApiService.getEvents();
    setEvents(evs);
    const regs = await ApiService.getRegistrations();
    setRegistrations(regs);
    const certs = await ApiService.getAllCertificates();
    setCertificates(certs);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'hackathon', label: 'المؤتمرات الكبرى' },
    { id: 'clinical', label: 'الصيدلة الإكلينيكية' },
    { id: 'workshop', label: 'ورش العمل والتأهيل' }
  ];

  const filteredEvents = events.filter(e => {
    const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // User's own registrations
  const userRegistrations = registrations.filter(r => 
    (currentUser && r.user_id === currentUser.id) || (currentUser && r.email === currentUser.email)
  );

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!registeringEvent) return;

    if (!regName.trim() || !regPhone.trim()) {
      setRegError('يرجى إدخال الاسم ورقم الهاتف.');
      return;
    }

    setRegLoading(true);
    try {
      const newReg = await ApiService.registerForEvent(
        registeringEvent.id,
        regName,
        regPhone,
        regEmail,
        currentUser?.id
      );
      await loadData();
      const currentEv = registeringEvent;
      setRegisteringEvent(null);
      onOpenTicket(newReg, currentEv);
    } catch (err: any) {
      setRegError(err.message || 'فشل التسجيل في الفعالية.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleClaimCertificate = async (reg: EventRegistration) => {
    let cert = certificates.find(c => c.registration_id === reg.id);
    if (!cert && reg.attendance_status === 'attended') {
      try {
        cert = await ApiService.issueCertificateForRegistration(reg, currentUser || undefined);
        await loadData();
      } catch (e) {
        console.error('Failed to issue certificate:', e);
      }
    }
    if (cert) {
      onOpenCertificate(cert);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-100">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>الفعاليات والمؤتمرات المعتمدة</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          سجّل في مؤتمرات وورش عمل Aliens
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          فرصتك لاكتساب مهارات متقدمة في الصيدلة وتحليل البيانات وحضور مؤتمرات بحضور كبار قادة المجال الطبي.
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            كافة الفعاليات المتاحة
          </button>
          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'my_tickets'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>تذاكري وشهاداتي ({userRegistrations.length})</span>
          </button>
        </div>

        {activeTab === 'all' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث في الفعاليات..."
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs"
              />
            </div>
            <div className="flex items-center gap-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    selectedCategory === c.id
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold'
                      : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: ALL EVENTS */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((ev) => {
            const isFull = ev.capacity && ev.current_attendees_count >= ev.capacity;
            return (
              <div
                key={ev.id}
                className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 shadow-xl"
              >
                <div>
                  {ev.image_url && (
                    <div className="h-52 overflow-hidden relative">
                      <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-emerald-400">
                        {ev.category.toUpperCase()}
                      </div>
                      {ev.certificate_enabled && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-700 text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>شهادة معتمدة</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{new Date(ev.event_date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 leading-snug">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {ev.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      {ev.current_attendees_count} / {ev.capacity}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isFull ? 'المقاعد مكتملة' : 'مقعد محجوز'}
                    </span>
                  </div>

                  <button
                    onClick={() => setRegisteringEvent(ev)}
                    disabled={isFull || !ev.registration_open}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{isFull ? 'اكتمل العدد' : 'حجز مقعد مجاني'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MY TICKETS & REGISTRATIONS */}
      {activeTab === 'my_tickets' && (
        <div className="space-y-6">
          {!currentUser && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-100">سجّل الدخول لعرض تذاكرك وشهاداتك</h3>
              <p className="text-xs text-slate-400">
                تسجيل الدخول يتيح لك مزامنة تذاكرك الرسمية واستخراج شهادات إتمام الفعاليات مباشرة.
              </p>
              <button
                onClick={onOpenAuth}
                className="px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                تسجيل الدخول
              </button>
            </div>
          )}

          {userRegistrations.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
              لا توجد تذاكر مسجلة حتى الآن. يمكنك استعراض الفعاليات وحجز مقعدك فوراً.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRegistrations.map((reg) => {
                const ev = events.find(e => e.id === reg.event_id);
                const hasCert = certificates.some(c => c.registration_id === reg.id);

                return (
                  <div
                    key={reg.id}
                    className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                          {reg.ticket_code}
                        </span>
                        
                        {/* Attendance state badge */}
                        {reg.attendance_status === 'attended' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>تم إكمال الفعالية — الشهادة جاهزة</span>
                          </span>
                        ) : reg.attendance_status === 'not_completed' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-700 text-red-300 text-xs font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                            <span>لم تقم بإكمال الفعالية</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-700 text-blue-300 text-xs font-bold">
                            مسجل — في انتظار الحضور
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-100">{ev?.title || 'فعالية معتمدة'}</h3>
                      <p className="text-xs text-slate-400 mt-1">اسم المسجل: {reg.registrant_name}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => ev && onOpenTicket(reg, ev)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>عرض التذكرة والـ QR</span>
                      </button>

                      {reg.attendance_status === 'attended' && (
                        <button
                          onClick={() => handleClaimCertificate(reg)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>عرض وطباعة الشهادة</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">تأكيد حجز تذكرة الفعالية</h3>
                <p className="text-[10px] text-emerald-400">{registeringEvent.title}</p>
              </div>
              <button 
                onClick={() => setRegisteringEvent(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {regError && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الاسم بالكامل (يطبع على الشهادة) *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="محمد عبدالله علي"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  رقم الهاتف / واتساب *
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{regLoading ? 'جاري إصدار التذكرة...' : 'تأكيد الحجز واستلام التذكرة'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
