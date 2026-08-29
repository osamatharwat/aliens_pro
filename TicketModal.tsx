import React, { useState } from 'react';
import { X, Ticket, CheckCircle2, QrCode, Copy, Check } from 'lucide-react';
import { EventItem, EventRegistration } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: EventRegistration | null;
  event: EventItem | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, registration, event }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !registration || !event) return null;

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(registration.ticket_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registration.ticket_code)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">تذكرة الحضور الرسمية</h3>
              <p className="text-[10px] text-slate-400">Aliens Event Access Pass</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-4">
          
          {/* Card Layout */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/30 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">ALIENS EVENT PASS</span>
                <h4 className="text-sm font-extrabold text-slate-100 mt-0.5">{event.title}</h4>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                registration.attendance_status === 'attended'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-blue-950 text-blue-300 border border-blue-800'
              }`}>
                {registration.attendance_status === 'attended' ? 'حاضر معتمد' : 'مؤكد الحجز'}
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5 border-t border-slate-800/80 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">اسم الحاضر:</span>
                <span className="font-bold text-slate-200">{registration.registrant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الهاتف:</span>
                <span className="font-mono text-slate-300">{registration.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المكان والتاريخ:</span>
                <span className="text-slate-300">{new Date(event.event_date).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>

            {/* QR Section */}
            <div className="mt-4 pt-4 border-t border-dashed border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500">كود التذكرة الفريد:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-emerald-400">{registration.ticket_code}</span>
                  <button
                    onClick={handleCopyTicket}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="نسخ الكود"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-white">
                <img src={qrUrl} alt="QR Code" className="w-16 h-16" />
              </div>
            </div>

          </div>

          <p className="text-[11px] text-slate-400 text-center">
            يرجى إبراز هذه التذكرة أو رمز الـ QR عند بوابة الدخول لمنظمي لجنة Event Planning.
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            إغلاق
          </button>

        </div>
      </div>
    </div>
  );
};
