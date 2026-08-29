import { CertificateItem } from '../types';

export function renderCertificateSVG(cert: CertificateItem): string {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://aliens-space.org/verify?code=' + cert.verification_code)}`;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850" width="100%" height="100%" style="background:#090d16; font-family:'Cairo', 'Segoe UI', Tahoma, sans-serif;">
    <defs>
      <linearGradient id="emeraldGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="50%" stop-color="#06b6d4" />
        <stop offset="100%" stop-color="#3b82f6" />
      </linearGradient>
      <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5" opacity="0.3"/>
      </pattern>
    </defs>

    <!-- Background Grid & Glow -->
    <rect width="1200" height="850" fill="#090d16" />
    <rect width="1200" height="850" fill="url(#grid)" />
    <circle cx="600" cy="425" r="380" fill="#10b981" opacity="0.03" filter="blur(80px)" />
    
    <!-- Outer Ornamental Border -->
    <rect x="30" y="30" width="1140" height="790" rx="16" fill="none" stroke="#1e293b" stroke-width="2" />
    <rect x="45" y="45" width="1110" height="760" rx="12" fill="none" stroke="url(#emeraldGold)" stroke-width="2.5" opacity="0.85" />
    
    <!-- Corner Tech Brackets -->
    <path d="M 55 95 L 55 55 L 95 55" fill="none" stroke="#10b981" stroke-width="4" />
    <path d="M 1145 95 L 1145 55 L 1105 55" fill="none" stroke="#10b981" stroke-width="4" />
    <path d="M 55 755 L 55 795 L 95 795" fill="none" stroke="#10b981" stroke-width="4" />
    <path d="M 1145 755 L 1145 795 L 1105 795" fill="none" stroke="#10b981" stroke-width="4" />

    <!-- Top Header -->
    <text x="600" y="110" text-anchor="middle" fill="#10b981" font-size="16" font-weight="700" letter-spacing="4">DELTA UNIVERSITY FOR SCIENCE &amp; TECHNOLOGY — FACULTY OF PHARMACY</text>
    <text x="600" y="140" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="600" letter-spacing="2">ALIENS STUDENT ACTIVITY — ACADEMIC &amp; SCIENTIFIC SECTOR</text>

    <!-- Emblem Symbol -->
    <g transform="translate(600, 185)">
      <circle cx="0" cy="0" r="28" fill="#0f172a" stroke="#10b981" stroke-width="2" />
      <polygon points="0,-14 12,10 -12,10" fill="none" stroke="#38bdf8" stroke-width="2" />
      <circle cx="0" cy="2" r="4" fill="#10b981" />
    </g>

    <!-- Certificate Title -->
    <text x="600" y="260" text-anchor="middle" fill="#f8fafc" font-size="34" font-weight="800" letter-spacing="1">شهادة إتمام ومشاركة معتمدة</text>
    <text x="600" y="290" text-anchor="middle" fill="url(#goldGlow)" font-size="15" font-weight="700" letter-spacing="3">OFFICIAL CERTIFICATE OF COMPLETION</text>

    <!-- Body Text -->
    <text x="600" y="345" text-anchor="middle" fill="#94a3b8" font-size="17">يشهد مجلس إدارة كيان Aliens وكلية الصيدلة بأن الزميل /</text>
    
    <!-- Recipient Name -->
    <text x="600" y="410" text-anchor="middle" fill="#34d399" font-size="36" font-weight="800">${cert.recipient_name}</text>
    <line x1="350" y1="435" x2="850" y2="435" stroke="#1e293b" stroke-width="1.5" />

    <!-- Event Completion Text -->
    <text x="600" y="475" text-anchor="middle" fill="#cbd5e1" font-size="18">قد أتم بنجاح كافة متطلبات الحضور والمشاركة الفعالة في:</text>
    <text x="600" y="525" text-anchor="middle" fill="#38bdf8" font-size="28" font-weight="800">${cert.event_title}</text>
    
    <!-- Date & Code Badge -->
    <rect x="420" y="560" width="360" height="38" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1" />
    <text x="600" y="585" text-anchor="middle" fill="#a7f3d0" font-size="14" font-weight="600">تاريخ الانعقاد: ${cert.event_date ? new Date(cert.event_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'سبتمبر 2026'}</text>

    <!-- Signatures & Verification Area -->
    <g transform="translate(140, 640)">
      <!-- QR Code & Security Stamp -->
      <image href="${qrUrl}" x="0" y="0" width="90" height="90" />
      <text x="110" y="30" fill="#94a3b8" font-size="13" font-weight="600">رمز التحقق الأمني المعتمد:</text>
      <text x="110" y="55" fill="#10b981" font-size="15" font-weight="800" font-family="'JetBrains Mono', monospace">${cert.verification_code}</text>
      <text x="110" y="75" fill="#64748b" font-size="11">امسح الرمز أو تحقق عبر: aliens-space.org/verify</text>
    </g>

    <!-- Official Seal Badge -->
    <g transform="translate(600, 685)">
      <circle cx="0" cy="0" r="38" fill="#042f2e" stroke="#10b981" stroke-width="2" />
      <circle cx="0" cy="0" r="32" fill="none" stroke="#38bdf8" stroke-dasharray="3,3" stroke-width="1" />
      <text x="0" y="-8" text-anchor="middle" fill="#34d399" font-size="9" font-weight="800" letter-spacing="1">VERIFIED</text>
      <text x="0" y="6" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="900">ALIENS</text>
      <text x="0" y="18" text-anchor="middle" fill="#38bdf8" font-size="8" font-weight="700">SEAL 2026</text>
    </g>

    <!-- Right Signatory -->
    <g transform="translate(860, 645)">
      <text x="120" y="20" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="700">${cert.signatory_name || 'Aliens High Board'}</text>
      <text x="120" y="42" text-anchor="middle" fill="#94a3b8" font-size="13">${cert.signatory_title || 'President & Academic Dean'}</text>
      <path d="M 40 55 Q 120 70 200 55" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.6" />
      <text x="120" y="75" text-anchor="middle" fill="#475569" font-size="11">رئاسة الكيان وعمادة الكلية</text>
    </g>
  </svg>
  `;
}

export function downloadCertificatePNG(cert: CertificateItem) {
  const svgString = renderCertificateSVG(cert);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(img, 0, 0, 2400, 1700);
    const pngUrl = canvas.toDataURL('image/png');
    
    const a = document.createElement('a');
    a.download = `Aliens_Certificate_${cert.verification_code}.png`;
    a.href = pngUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

export function printCertificate(cert: CertificateItem) {
  const svgString = renderCertificateSVG(cert);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <title>شهادة معتمدة — ${cert.recipient_name} — ${cert.verification_code}</title>
        <style>
          @page { size: landscape; margin: 0; }
          body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #090d16; }
          svg { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        ${svgString}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
