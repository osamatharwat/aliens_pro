import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Printer, ShieldCheck, Copy, Check } from 'lucide-react';
import { CertificateItem } from '../types';
import { renderCertificateSVG, downloadCertificatePNG, printCertificate } from '../lib/certificateGenerator';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateItem | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, certificate }) => {
  const [copied, setCopied] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Body scroll lock & ESC key event handling with proper cleanup
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle ESC key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Revert body scroll
      document.body.style.overflow = previousOverflow || 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !certificate) return null;

  const handleCopyCode = () => {
    if (!certificate.verification_code) return;
    navigator.clipboard.writeText(certificate.verification_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const svgContent = renderCertificateSVG(certificate);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
    >
      <div 
        ref={modalContainerRef}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 id="cert-modal-title" className="text-sm font-bold text-slate-100">شهادة إتمام ومشاركة معتمدة</h3>
              <p className="text-[10px] text-emerald-400 font-mono">CODE: {certificate.verification_code}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              title="نسخ كود التحقق"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>

            <button
              onClick={() => printCertificate(certificate)}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              title="طباعة الشهادة"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>

            <button
              onClick={() => downloadCertificatePNG(certificate)}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              title="تحميل كصورة PNG عالية الدقة"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل PNG</span>
            </button>

            <button 
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Screen */}
        <div className="p-6 bg-[#060913] flex items-center justify-center overflow-x-auto">
          <div 
            className="w-full max-w-3xl aspect-[1200/850] shadow-2xl rounded-xl overflow-hidden border border-emerald-900/40 select-none"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>شهادة أصلية موثقة إلكترونياً وغير قابلة للتزوير</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            تاريخ الإصدار: {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('ar-EG') : '2026'}
          </span>
        </div>

      </div>
    </div>
  );
};
