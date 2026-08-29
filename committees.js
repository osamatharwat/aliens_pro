/**
 * services/committees.js
 * Definitions and workspaces for the 9 canonical committees.
 */
const CommitteeService = {
  COMMITTEES: [
    { key: 'marketing', nameEn: 'Marketing', nameAr: 'التسويق', tagEn: 'Growth & Branding', tagAr: 'النمو والهوية', icon: 'fa-chart-line', descAr: 'نضع الخطط والاستراتيجيات لنشر فكر Aliens بدقة وصناعة تأثير واضح.' },
    { key: 'media', nameEn: 'Media', nameAr: 'الميديا', tagEn: 'Creative Team', tagAr: 'الفريق الإبداعي', icon: 'fa-camera-retro', descAr: 'عين التيم التي توثق الرحلة وتنتج التصاميم والفيديوهات بأعلى جودة.' },
    { key: 'pr', nameEn: 'Public Relations', nameAr: 'العلاقات العامة', tagEn: 'Partnerships', tagAr: 'الشراكات والرعاة', icon: 'fa-handshake', descAr: 'نبني الجسور مع الشركات والمحاضرين والجهات الخارجية لضمان شراكات ناجحة.' },
    { key: 'ir', nameEn: 'Internal Relations', nameAr: 'العلاقات الداخلية', tagEn: 'Team Culture', tagAr: 'بيئة الفريق', icon: 'fa-users-gear', descAr: 'نهتم بالطاقم الداخلي ونتابع الأداء ونحافظ على بيئة إيجابية داخل التيم.' },
    { key: 'magic_hand', nameEn: 'Magic Hand', nameAr: 'ماجيك هاند', tagEn: 'Decoration Team', tagAr: 'فريق الديكور', icon: 'fa-wand-magic-sparkles', descAr: 'نحوّل الأفكار إلى ديكورات ومجسمات تعكس هوية الفضاء في كل حدث.' },
    { key: 'charity', nameEn: 'Charity', nameAr: 'الأعمال الخيرية', tagEn: 'Community Impact', tagAr: 'الأثر المجتمعي', icon: 'fa-hand-holding-heart', descAr: 'ننظم حملات الدعم والمساعدات المجتمعية ونترك أثرًا إنسانيًا واضحًا.' },
    { key: 'secretary', nameEn: 'Secretary', nameAr: 'السكرتارية', tagEn: 'Operations', tagAr: 'العمليات والتوثيق', icon: 'fa-folder-open', descAr: 'مسؤولون عن الإدارة والتوثيق وتنظيم البيانات بكل دقة وانضباط.' },
    { key: 'event_planning', nameEn: 'Event Planning', nameAr: 'تنظيم الفعاليات', tagEn: 'Event Management', tagAr: 'إدارة الفعاليات', icon: 'fa-calendar-check', descAr: 'نخطط لكل حدث من البداية للنهاية ونضمن تجربة مبهرة للجمهور.' },
    { key: 'data_analysis', nameEn: 'Data Analysis', nameAr: 'تحليل البيانات', tagEn: 'Intelligence & Insights', tagAr: 'التحليلات والذكاء', icon: 'fa-database', descAr: 'لجنة تحليل البيانات وقياس أداء الفعاليات ومؤشرات إنجاز الأعضاء بدقة.' }
  ],

  getCommittees() {
    return this.COMMITTEES;
  },

  getCommitteeByKey(key) {
    if (!key) return null;
    const clean = String(key).toLowerCase().replace(/\s+/g, '_');
    return this.COMMITTEES.find(c => c.key === clean || c.key.replace('_', '') === clean.replace('_', '')) || null;
  }
};

window.CommitteeService = CommitteeService;
