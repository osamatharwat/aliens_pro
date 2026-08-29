import { supabase } from '../lib/supabase';
import { Committee, CommitteeKey, Profile } from '../types';
import { auditService } from './auditService';

export const CANONICAL_COMMITTEES: Committee[] = [
  {
    id: 'comm_marketing',
    key: 'marketing',
    name: 'Marketing Committee',
    arabic_name: 'لجنة التسويق (Marketing)',
    category: 'Operational',
    description: 'بناء الهوية البصرية، صياغة الاستراتيجيات التسويقية الرقمية، إدارة الحملات الإعلانية، والترويج لكافة مؤتمرات وفعاليات الكيان.',
    goals: ['تصميم حملات تسويقية مبتكرة', 'زيادة التفاعل المجتمعي بنسبة 50%', 'إدارة استراتيجيات إطلاق المشاريع'],
    requirements: ['مهارات الكتابة الإعلانية (Copywriting)', 'فهم سلوك المستهلك الرقمي', 'التفكير الاستراتيجي والتحليلي'],
    head_name: 'أحمد محمود',
    sub_head_name: 'سارة طارق',
    active_members_count: 18,
    icon_name: 'Megaphone'
  },
  {
    id: 'comm_pr',
    key: 'pr',
    name: 'Public Relations',
    arabic_name: 'لجنة العلاقات العامة (PR)',
    category: 'Academics & PR',
    description: 'إدارة الشراكات الاستراتيجية مع الشركات، المؤسسات، الرعاة، والمتحدثين الرسميين، وتمثيل الكيان أمام المجتمع الأكاديمي والمهني.',
    goals: ['توقيع بروتوكولات تعاون مع كبرى الشركات', 'استقطاب متحدثين دوليين', 'بناء شبكة علاقات قوية للطلاب'],
    requirements: ['مهارات تواصل وتفاوض استثنائية', 'إجادة اللغة الإنجليزية والعربية باحترافية', 'اللباقة وحل المشكلات'],
    head_name: 'مروان عادل',
    sub_head_name: 'ملك حسام',
    active_members_count: 15,
    icon_name: 'Handshake'
  },
  {
    id: 'comm_media',
    key: 'media',
    name: 'Media & Production',
    arabic_name: 'لجنة الميديا والإنتاج (Media)',
    category: 'Tech & Media',
    description: 'التغطية البصرية الشاملة، صناعة الفيديو والريلز، التصميم الجرافيكي الاحترافي، وإنتاج المحتوى الرقمي الجذاب.',
    goals: ['إنتاج محتوى مرئي احترافي لكافة الفعاليات', 'توثيق كافة المؤتمرات بجودة سينمائية', 'تصميم بوسترات ومطبوعات الكيان'],
    requirements: ['إجادة أدوات التصميم (Adobe Photoshop, Illustrator)', 'خبرة في المونتاج (Premiere / After Effects)', 'حس فني وإبداعي عالي'],
    head_name: 'يوسف شريف',
    sub_head_name: 'نور الهدى',
    active_members_count: 22,
    icon_name: 'Camera'
  },
  {
    id: 'comm_ir',
    key: 'ir',
    name: 'Internal Relations',
    arabic_name: 'لجنة العلاقات الداخلية (IR)',
    category: 'Operational',
    description: 'متابعة أداء الأعضاء، إجراء مقابلات القبول، التقييم الشهري القياسي، حل النزاعات الداخلية، وبناء بيئة عمل داعمة ومحفزة.',
    goals: ['متابعة وتقييم جميع أفراد الفريق شهرياً', 'إدارة دورة التعيين وإجراء المقابلات الشخصية', 'تعزيز الولاء وروح الفريق'],
    requirements: ['العدالة والحيادية والموضوعية', 'مهارات استماع وتقييم نفسي وسلوكي', 'إدارة النزاعات والتوجيه الإيجابي'],
    head_name: 'عمر خالد',
    sub_head_name: 'فريدة إبراهيم',
    active_members_count: 14,
    icon_name: 'Users'
  },
  {
    id: 'comm_event_planning',
    key: 'event_planning',
    name: 'Event Planning (Logistics)',
    arabic_name: 'لجنة التنظيم واللوجستيات (Event Planning)',
    category: 'Operational',
    description: 'التخطيط اللوجستي الشامل للمؤتمرات، إدارة الحشود والتذاكر، حجز القاعات، وإخراج الفعاليات على أرض الواقع بأعلى معايير الانضباط.',
    goals: ['إدارة الفعاليات والمؤتمرات الميدانية باحترافية', 'تنظيم دخول وحضور آلاف الطلاب', 'إدارة الميزانيات التشغيلية والمشتريات'],
    requirements: ['إدارة الوقت والقدرة على العمل تحت الضغط', 'المرونة وسرعة اتخاذ القرار الميداني', 'القيادة والعمل الجماعي'],
    head_name: 'كريم سامي',
    sub_head_name: 'سلمى نبيل',
    active_members_count: 25,
    icon_name: 'Calendar'
  },
  {
    id: 'comm_secretary',
    key: 'secretary',
    name: 'Secretary & Documentation',
    arabic_name: 'لجنة السكرتارية والتوثيق (Secretary)',
    category: 'Operational',
    description: 'إدارة السجلات الرسمية، تدوين محاضر الاجتماعات، أرشفة الشهادات، ومتابعة الخطط الزمنية لكل اللجان.',
    goals: ['أرشفة كافة أعمال الكيان وسجلاته الرسمية', 'تدوين ومتابعة قرارات مجلس الإدارة', 'تنظيم المراسلات والشهادات المعتمدة'],
    requirements: ['الدقة والاهتمام بأدق التفاصيل', 'مهارات تنظيم البيانات وإدارة الملفات', 'السرية والأمانة في حفظ السجلات'],
    head_name: 'هنا مصطفى',
    sub_head_name: 'زياد حازم',
    active_members_count: 12,
    icon_name: 'FileText'
  },
  {
    id: 'comm_charity',
    key: 'charity',
    name: 'Charity & Community Service',
    arabic_name: 'لجنة العمل الخيري والمجتمعي (Charity)',
    category: 'Community & Charity',
    description: 'قيادة القوافل الطبية والتوعوية، تنظيم الحملات الخيرية، مساعدة الطلاب غير القادرين، وخدمة المجتمع المحلي.',
    goals: ['تنظيم قوافل علاجية مجانية في القرى والمراكز', 'جمع وتوزيع التبرعات للأسر الأكثر احتياجاً', 'نشر الوعي الصحي المجتمعي'],
    requirements: ['الشغف بالعمل التطوعي والإنساني', 'القدرة على التنسيق الميداني والإغاثي', 'روح التعاطف والمبادرة'],
    head_name: 'مصطفى عثمان',
    sub_head_name: 'أمينة زكي',
    active_members_count: 20,
    icon_name: 'Heart'
  },
  {
    id: 'comm_magic_hand',
    key: 'magic_hand',
    name: 'Magic Hand (Decoration & Craft)',
    arabic_name: 'لجنة الديكور والإبداع (Magic Hand)',
    category: 'Community & Charity',
    description: 'تصميم وبناء الديكورات الميدانية للفعاليات، الأعمال اليدوية والهدايا التذكارية، وإضفاء الطابع الجمالي المميز لكل حدث.',
    goals: ['تصميم وتنفيذ ديكورات الفعاليات والمؤتمرات', 'صناعة الهدايا التذكارية المبتكرة', 'إبراز هوية الكيان في المعارض'],
    requirements: ['مهارات يدوية وفنية وحرفية', 'القدرة على إعادة التدوير والابتكار', 'العمل الجماعي والسرعة في التنفيذ'],
    head_name: 'داليا أشرف',
    sub_head_name: 'محمد أنور',
    active_members_count: 16,
    icon_name: 'Sparkles'
  },
  {
    id: 'comm_data_analysis',
    key: 'data_analysis',
    name: 'Data Analysis & Insights',
    arabic_name: 'لجنة تحليل البيانات (Data Analysis)',
    category: 'Tech & Media',
    description: 'تحليل استبيانات الحضور، قياس أداء الحملات والفعاليات بالأرقام، إعداد تقارير المؤشرات والداشبورد، ودعم اتخاذ القرارات بالبيانات.',
    goals: ['بناء لوحات بيانات تفاعلية لكافة مؤشرات الكيان', 'تحليل استبيانات رضا الطلاب والحضور بعد كل حدث', 'تحسين معدلات التحويل وجودة القرارات التنظيمية'],
    requirements: ['معرفة بأدوات تحليل البيانات (Excel, Python, PowerBI, SQL)', 'التفكير المنطقي واستخراج الرؤى (Insights)', 'القدرة على إعداد تقارير الأداء التنفيذية'],
    head_name: 'رامي بدر',
    sub_head_name: 'ياسمين خليل',
    active_members_count: 14,
    icon_name: 'BarChart'
  }
];

export const committeeService = {
  /**
   * Get all active committees (Supabase backed with fallback)
   */
  async getAllCommittees(): Promise<Committee[]> {
    try {
      const { data, error } = await supabase
        .from('committees')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(c => ({
          id: String(c.id || c.key),
          key: c.key as CommitteeKey,
          name: c.name,
          arabic_name: c.arabic_name || c.name,
          category: c.category || 'Operational',
          description: c.description || '',
          goals: Array.isArray(c.goals) ? c.goals : (c.goals ? JSON.parse(c.goals) : []),
          requirements: Array.isArray(c.requirements) ? c.requirements : (c.requirements ? JSON.parse(c.requirements) : []),
          head_name: c.head_name || 'قائد اللجنة',
          sub_head_name: c.sub_head_name || 'نائب القائد',
          active_members_count: c.active_members_count || 15,
          icon_name: c.icon_name || 'Layers'
        }));
      }
    } catch (e) {
      console.warn('getAllCommittees exception:', e);
    }

    return CANONICAL_COMMITTEES;
  },

  /**
   * Get committee details by key
   */
  async getCommitteeByKey(key: CommitteeKey): Promise<Committee | null> {
    const all = await this.getAllCommittees();
    return all.find(c => c.key === key) || null;
  },

  /**
   * Create committee (Authorized leadership only)
   */
  async createCommittee(committeeData: Partial<Committee>, actor: Profile): Promise<Committee> {
    const newComm = {
      key: committeeData.key,
      name: committeeData.name,
      arabic_name: committeeData.arabic_name,
      category: committeeData.category || 'Operational',
      description: committeeData.description || '',
      goals: committeeData.goals || [],
      requirements: committeeData.requirements || [],
      head_name: committeeData.head_name || 'قائد اللجنة',
      sub_head_name: committeeData.sub_head_name || 'نائب القائد',
      active_members_count: 0,
      icon_name: committeeData.icon_name || 'Layers',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('committees')
      .insert([newComm])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل إضافة اللجنة الجديدة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'CREATE_COMMITTEE',
      entity_type: 'committees',
      entity_id: String(data.id),
      details: `أنشأ لجنة ${data.arabic_name}`
    });

    return data as Committee;
  },

  /**
   * Update committee
   */
  async updateCommittee(id: string, updates: Partial<Committee>, actor: Profile): Promise<Committee> {
    const { data, error } = await supabase
      .from('committees')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل تحديث بيانات اللجنة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UPDATE_COMMITTEE',
      entity_type: 'committees',
      entity_id: id,
      details: `تحديث بيانات لجنة ${data.arabic_name}`
    });

    return data as Committee;
  },

  /**
   * Archive / Deactivate committee safely
   */
  async archiveCommittee(id: string, actor: Profile): Promise<void> {
    const { error } = await supabase
      .from('committees')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'فشل أرشفة اللجنة.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'ARCHIVE_COMMITTEE',
      entity_type: 'committees',
      entity_id: id,
      details: `أرشفة اللجنة`
    });
  }
};
