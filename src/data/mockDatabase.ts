import { 
  Profile, 
  Committee, 
  EventItem, 
  EventRegistration, 
  CertificateItem, 
  TaskItem, 
  DynamicQuestion, 
  ApplicationItem, 
  AccessCodeItem, 
  IRAssignment, 
  EvaluationItem, 
  MemoryItem, 
  GalleryAlbum, 
  ProjectItem, 
  InternshipItem, 
  CulturalResource, 
  AuditLogItem, 
  SiteSettings 
} from '../types';

export const INITIAL_COMMITTEES: Committee[] = [
  {
    id: 'comm_marketing',
    key: 'marketing',
    name: 'Marketing Committee',
    arabic_name: 'لجنة التسويق وإدارة الحملات',
    category: 'Operational',
    description: 'صياغة الاستراتيجيات الترويجية، إدارة الحملات التسويقية الميدانية والرقمية، وتوسيع نطاق وصول فعاليات الكيان.',
    goals: ['بناء خطط تسويقية شاملة لكل مؤتمر', 'تحليل اهتمامات الطلاب واستهداف الجمهور المناسب', 'إدارة قنوات التواصل والإعلانات الممولة'],
    requirements: ['فهم أساسيات الـ Digital Marketing', 'مهارات كتابة المحتوى الإعلاني Copywriting', 'القدرة على التفكير الإبداعي والتحليلي'],
    head_name: 'ياسمين ممدوح',
    sub_head_name: 'فارس عبدالمجيد',
    active_members_count: 14,
    icon_name: 'Megaphone'
  },
  {
    id: 'comm_pr',
    key: 'pr',
    name: 'Public Relations (PR)',
    arabic_name: 'لجنة العلاقات العامة والشراكات',
    category: 'Academics & PR',
    description: 'بناء الشراكات الاستراتيجية مع مصانع وشركات الأدوية الكبرى، استقطاب الرعاة (Sponsors)، والتمثيل الخارجي الرسمي.',
    goals: ['توقيع بروتوكولات تعاون مع المستشفيات والشركات', 'تأمين رعاية مالية وأكاديمية للمؤتمرات', 'استضافة كبار المحاضرين والمتحدثين'],
    requirements: ['مهارات تفاوض وإقناع عالية', 'لباقة استثنائية في التواصل الرسمي', 'إتقان كتابة الخطابات والـ Proposals'],
    head_name: 'كريم أشرف السعدني',
    sub_head_name: 'منى حامد بركات',
    active_members_count: 12,
    icon_name: 'Handshake'
  },
  {
    id: 'comm_media',
    key: 'media',
    name: 'Media & Production',
    arabic_name: 'لجنة الميديا والإنتاج المرئي',
    category: 'Tech & Media',
    description: 'تصميم الهوية البصرية، إنتاج المواد المرئية، تصوير وتوثيق الفعاليات، ومونتاج الأفلام الوثائقية للكيان.',
    goals: ['ابتكار هويات بصرية متكاملة للمؤتمرات', 'تغطية احترافية بالصور والفيديو لجميع الأنشطة', 'إنتاج Motion Graphics وReels توعوية صيدلانية'],
    requirements: ['إتقان برامج Adobe (Photoshop, Illustrator, Premiere)', 'خبرة في التصوير الفوتوغرافي والفيديو', 'شغف بالفنون البصرية والإخراج'],
    head_name: 'نوران خالد إبراهيم',
    sub_head_name: 'سيف الدين ماجد',
    active_members_count: 16,
    icon_name: 'Camera'
  },
  {
    id: 'comm_ir',
    key: 'ir',
    name: 'Internal Relations (IR)',
    arabic_name: 'لجنة العلاقات الداخلية وتقييم الأداء',
    category: 'Operational',
    description: 'العمود الفقري لمتابعة أداء الأعضاء، تقييم الالتزام الشهري، حل النزاعات، وتعزيز روح العمل الجماعي والانتماء.',
    goals: ['متابعة أداء الأعضاء عبر منظومة تقييم موضوعية', 'تنظيم ورش عمل لبناء الفريق Team Building', 'تقديم تقارير دورية لمجلس الإدارة حول بيئة العمل'],
    requirements: ['مهارات استماع وتواصل إنساني متقدمة', 'الحيادية التامة والسرية في التعامل', 'القدرة على فض النزاعات وتحفيز الأفراد'],
    head_name: 'أحمد سامي عبدالعزيز',
    sub_head_name: 'رنا وائل النجار',
    active_members_count: 15,
    icon_name: 'UsersCheck'
  },
  {
    id: 'comm_event_planning',
    key: 'event_planning',
    name: 'Event Planning & Logistics',
    arabic_name: 'لجنة تنظيم الفعاليات واللوجستيات',
    category: 'Operational',
    description: 'التخطيط الميداني لإدارة المؤتمرات وورش العمل، توفير التجهيزات الصوتية والمرئية، وتنسيق دخول وخروج الحضور بسلاسة.',
    goals: ['إدارة القاعات والمنصات بدقة واحترافية', 'تجهيز كافة المستلزمات اللوجستية قبل الفعاليات', 'حل أي طارئ تنظيمي بكفاءة وسرعة'],
    requirements: ['القدرة على العمل تحت الضغط البدني والذهني', 'مهارات إدارة الوقت وسرعة البديهة', 'العمل الجماعي والروح القيادية الميدانية'],
    head_name: 'محمود رضوان حجازي',
    sub_head_name: 'هند مصطفى كمال',
    active_members_count: 18,
    icon_name: 'CalendarClock'
  },
  {
    id: 'comm_secretary',
    key: 'secretary',
    name: 'Secretary & Documentation',
    arabic_name: 'لجنة السكرتارية والتوثيق الإداري',
    category: 'Operational',
    description: 'تدوين محاضر الاجتماعات الرسمية، أرشفة بيانات وأوراق الكيان، تنظيم المواعيد، وضمان الانضباط الإداري.',
    goals: ['أرشفة رقمية آمنة لجميع قرارات ومحاضر الكيان', 'تنظيم جداول المواعيد لمجلس الإدارة', 'متابعة سجلات الحضور والغياب الرسمية'],
    requirements: ['الدقة الشديدة والتنظيم العالي', 'سرعة الكتابة وصياغة التقارير الإدارية', 'إجادة حزمة برامج المكتب والتوثيق السحابي'],
    head_name: 'سارة محمود الخولي',
    sub_head_name: 'مينا عماد غالي',
    active_members_count: 9,
    icon_name: 'FileText'
  },
  {
    id: 'comm_charity',
    key: 'charity',
    name: 'Charity & Community Service',
    arabic_name: 'لجنة العمل الخيري وخدمة المجتمع',
    category: 'Community & Charity',
    description: 'تنظيم القوافل الطبية العلاجية، حملات التبرع بالدم، التوعية بالأمراض المزمنة، وتقديم المساعدات الإنسانية.',
    goals: ['إطلاق 4 قوافل علاجية مجانية سنوياً بالدلتا', 'تنظيم حملات توعية صحية في المدارس والقرى', 'التعاون مع بنوك الدم والمؤسسات الخيرية الكبرى'],
    requirements: ['الشغف الحقيقي بالعمل التطوعي والإنساني', 'معرفة أساسيات التثقيف الصحي الصيدلي', 'القدرة على التنسيق الميداني للقوافل'],
    head_name: 'د. آية هشام البكري',
    sub_head_name: 'إسلام محمد صبري',
    active_members_count: 20,
    icon_name: 'HeartHandshake'
  },
  {
    id: 'comm_magic_hand',
    key: 'magic_hand',
    name: 'Magic Hand & Art Décor',
    arabic_name: 'لجنة ماجيك هاند للديكور والإبداع اليدوي',
    category: 'Operational',
    description: 'تصميم وتنفيذ الديكورات المجسمة للفعاليات، تجهيز منصات التصوير Photo-booths، وإضفاء اللمسة الجمالية المميزة لـ Aliens.',
    goals: ['صنع مجسمات وديكورات تفاعلية مستوحاة من الفضاء والصيدلة', 'تجهيز هدايا الحضور والمحاضرين يدوياً برقي', 'إبهار زوار المعارض بلمسات فنية غير تقليدية'],
    requirements: ['مهارات في الرسم، النحت، والأعمال اليدوية Handicrafts', 'حس فني عالي وتذوق للألوان وتناسقها', 'الابتكار في استخدام الخامات وإعادة التدوير'],
    head_name: 'ندى شريف القاضي',
    sub_head_name: 'حازم طارق مرسي',
    active_members_count: 13,
    icon_name: 'Sparkles'
  },
  {
    id: 'comm_data_analysis',
    key: 'data_analysis',
    name: 'Data Analysis & Research',
    arabic_name: 'لجنة تحليل البيانات والبحث الصيدلي',
    category: 'Tech & Media',
    description: 'تحليل بيانات الحضور، قياس أثر الفعاليات بالأرقام، بناء لوحات القياس التفاعلية، ودعم الأبحاث الإحصائية للكيان.',
    goals: ['تحليل استبيانات الرضا واستخلاص نقاط التطوير إحصائياً', 'بناء Dashboards لمتابعة أداء اللجان في الوقت الفعلي', 'تحليل وتنبؤ اتجاهات التسجيل في المؤتمرات الصيدلانية'],
    requirements: ['إتقان Excel المتقدم، SQL، أو Python/R لتحليل البيانات', 'فهم مبادئ الإحصاء الحيوي Biostatistics', 'مهارات تحويل الأرقام إلى قرارات استراتيجية Data Storytelling'],
    head_name: 'عمر طارق النمر',
    sub_head_name: 'زياد حازم الشناوي',
    active_members_count: 11,
    icon_name: 'BarChart3'
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'prof_og_1',
    user_id: 'usr_og_1',
    username: 'aliens_president',
    full_name: 'د. أسامة ثروت الجوهري',
    email: 'osama.sarwat75@gmail.com',
    role: 'OG',
    committee_key: 'ir',
    committee_position: 'Head',
    phone: '+201012345678',
    student_id: 'PH-2022-001',
    is_evaluator: true,
    created_at: '2026-01-10'
  },
  {
    id: 'prof_data_head',
    user_id: 'usr_data_1',
    username: 'omar_data',
    full_name: 'عمر طارق النمر',
    email: 'omar.data@aliens-space.org',
    role: 'head',
    committee_key: 'data_analysis',
    committee_position: 'Head',
    phone: '+201099887766',
    student_id: 'PH-2023-145',
    is_evaluator: false,
    created_at: '2026-02-01'
  },
  {
    id: 'prof_data_sub',
    user_id: 'usr_data_2',
    username: 'ziad_data',
    full_name: 'زياد حازم الشناوي',
    email: 'ziad.data@aliens-space.org',
    role: 'sub_head',
    committee_key: 'data_analysis',
    committee_position: 'Sub Head',
    phone: '+201088776655',
    student_id: 'PH-2023-146',
    is_evaluator: false,
    created_at: '2026-02-01'
  },
  {
    id: 'prof_ir_evaluator_1',
    user_id: 'usr_ir_ev1',
    username: 'ahmed_evaluator',
    full_name: 'أحمد سامي عبدالعزيز',
    email: 'ahmed.ir@aliens-space.org',
    role: 'ir_head',
    committee_key: 'ir',
    committee_position: 'Head',
    phone: '+201077665544',
    student_id: 'PH-2022-088',
    is_evaluator: true,
    created_at: '2026-01-15'
  },
  {
    id: 'prof_ir_evaluator_2',
    user_id: 'usr_ir_ev2',
    username: 'rana_evaluator',
    full_name: 'رنا وائل النجار',
    email: 'rana.ir@aliens-space.org',
    role: 'ir_sub_head',
    committee_key: 'ir',
    committee_position: 'Sub Head',
    phone: '+201066554433',
    student_id: 'PH-2022-089',
    is_evaluator: true,
    created_at: '2026-01-15'
  },
  {
    id: 'prof_member_1',
    user_id: 'usr_mem_1',
    username: 'nour_media',
    full_name: 'نور الدين مصطفى',
    email: 'nour.m@gmail.com',
    role: 'member',
    committee_key: 'media',
    committee_position: 'Member',
    phone: '+201055443322',
    student_id: 'PH-2024-301',
    assigned_ir: 'prof_ir_evaluator_1',
    is_evaluator: false,
    created_at: '2026-03-01'
  },
  {
    id: 'prof_member_data',
    user_id: 'usr_mem_data',
    username: 'hassan_analyst',
    full_name: 'حسن محمود بدر',
    email: 'hassan.analyst@gmail.com',
    role: 'member',
    committee_key: 'data_analysis',
    committee_position: 'Member',
    phone: '+201044332211',
    student_id: 'PH-2024-302',
    assigned_ir: 'prof_ir_evaluator_2',
    is_evaluator: false,
    created_at: '2026-03-01'
  },
  {
    id: 'prof_member_pr',
    user_id: 'usr_mem_pr',
    username: 'salma_pr',
    full_name: 'سلمى إبراهيم حبيب',
    email: 'salma.pr@gmail.com',
    role: 'member',
    committee_key: 'pr',
    committee_position: 'Member',
    phone: '+201033221100',
    student_id: 'PH-2024-303',
    assigned_ir: 'prof_ir_evaluator_1',
    is_evaluator: false,
    created_at: '2026-03-01'
  }
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'ev_pharmatech_2026',
    title: 'PharmaTech & AI Summit 2026',
    description: 'المؤتمر السنوي الأضخم في دلتا مصر لمناقشة تطبيقات الذكاء الاصطناعي في اكتشاف وتصنيع الأدوية الحديثة، بالتعاون مع كبار مصنعي الدواء في مصر.',
    event_date: '2026-09-15T10:00:00Z',
    location: 'القاعة الكبرى — جامعة الدلتا للعلوم والتكنولوجيا',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    category: 'hackathon',
    is_public: true,
    is_published: true,
    certificate_enabled: true,
    registration_open: true,
    capacity: 350,
    current_attendees_count: 284,
    whatsapp_group_url: 'https://chat.whatsapp.com/AliensPharmaTech2026',
    action_link: '#register',
    created_at: '2026-08-01'
  },
  {
    id: 'ev_clinical_workshop',
    title: 'Clinical Pharmacology & ICU Masterclass',
    description: 'ورشة عمل طبية تطبيقية مكثفة مع استشاريي الصيدلة الإكلينيكية حول بروتوكولات العناية المركزة وحساب الجرعات المعقدة.',
    event_date: '2026-09-22T13:30:00Z',
    location: 'مدرج فارما 3 — كلية الصيدلة',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    category: 'clinical',
    is_public: true,
    is_published: true,
    certificate_enabled: true,
    registration_open: true,
    capacity: 120,
    current_attendees_count: 118,
    whatsapp_group_url: 'https://chat.whatsapp.com/AliensClinicalMasterclass',
    action_link: '#register',
    created_at: '2026-08-05'
  },
  {
    id: 'ev_bootcamp_newbies',
    title: 'Aliens Leadership & Onboarding Bootcamp',
    description: 'المعسكر التدريبي التأهيلي المغلق لأعضاء الكيان الجدد لإتقان مهارات الإدارة والتخطيط وحل المشكلات.',
    event_date: '2026-09-02T11:00:00Z',
    location: 'قاعة المؤتمرات 4B — المركز التكنولوجي',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    category: 'workshop',
    is_public: false,
    is_published: true,
    certificate_enabled: true,
    registration_open: true,
    capacity: 140,
    current_attendees_count: 140,
    created_at: '2026-08-10'
  }
];

export const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg_101',
    event_id: 'ev_pharmatech_2026',
    user_id: 'usr_mem_1',
    registrant_name: 'محمد عبدالله خليل',
    phone: '+201011223344',
    email: 'mohamed.khalil@gmail.com',
    ticket_code: 'TKT-ALPHA-9821',
    attendance_status: 'attended',
    attendance_marked_by: 'prof_og_1',
    attendance_marked_at: '2026-08-28T12:00:00Z',
    created_at: '2026-08-12'
  },
  {
    id: 'reg_102',
    event_id: 'ev_pharmatech_2026',
    user_id: 'usr_mem_data',
    registrant_name: 'حسن محمود بدر',
    phone: '+201044332211',
    email: 'hassan.analyst@gmail.com',
    ticket_code: 'TKT-BETA-4412',
    attendance_status: 'attended',
    attendance_marked_by: 'prof_og_1',
    attendance_marked_at: '2026-08-28T12:05:00Z',
    created_at: '2026-08-14'
  },
  {
    id: 'reg_103',
    event_id: 'ev_clinical_workshop',
    registrant_name: 'طارق زياد المهدي',
    phone: '+201077889900',
    email: 'tarek.mahdi@gmail.com',
    ticket_code: 'TKT-GAMMA-1055',
    attendance_status: 'not_completed',
    attendance_marked_by: 'prof_og_1',
    attendance_marked_at: '2026-08-28T12:10:00Z',
    created_at: '2026-08-15'
  }
];

export const INITIAL_CERTIFICATES: CertificateItem[] = [
  {
    id: 'cert_101',
    event_id: 'ev_pharmatech_2026',
    registration_id: 'reg_101',
    verification_code: 'AS-CERT-8849-DELTA',
    recipient_name: 'محمد عبدالله خليل',
    event_title: 'PharmaTech & AI Summit 2026',
    event_date: '2026-09-15',
    signatory_name: 'Aliens High Board & Academic Leadership',
    signatory_title: 'President & Dean of Faculty of Pharmacy',
    issued_at: '2026-08-28T12:00:00Z',
    user_id: 'usr_mem_1'
  },
  {
    id: 'cert_102',
    event_id: 'ev_pharmatech_2026',
    registration_id: 'reg_102',
    verification_code: 'AS-CERT-7731-DATA',
    recipient_name: 'حسن محمود بدر',
    event_title: 'PharmaTech & AI Summit 2026',
    event_date: '2026-09-15',
    signatory_name: 'Aliens High Board & Academic Leadership',
    signatory_title: 'President & Dean of Faculty of Pharmacy',
    issued_at: '2026-08-28T12:05:00Z',
    user_id: 'usr_mem_data'
  }
];

export const INITIAL_QUESTIONS: DynamicQuestion[] = [
  {
    id: 'q_g1',
    committee_key: 'global',
    question_text: 'لماذا اخترت الانضمام لكيان Aliens تحديداً وما هي القيمة المضافة التي تتوقع تقديمها؟',
    order_index: 1,
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 'q_g2',
    committee_key: 'global',
    question_text: 'كيف تدير وقتك بين دراستك الصيدلانية الشاقة والالتزام بمهام الأنشطة الطلابية؟',
    order_index: 2,
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 'q_ir1',
    committee_key: 'ir',
    question_text: 'إذا واجهت خلافاً حاداً مع زميل في نفس لجنتك أثناء تنظيم فعالية حية، كيف تتصرف بحيادية؟',
    order_index: 1,
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 'q_data1',
    committee_key: 'data_analysis',
    question_text: 'ما هي الأدوات واللغات التي تستخدمها لتحليل البيانات (Excel, PowerBI, SQL, Python)؟ صف مشروعاً قمت به.',
    order_index: 1,
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 'q_data2',
    committee_key: 'data_analysis',
    question_text: 'كيف تقيس نجاح مؤتمر صيدلاني حضره 500 طالب باستخدام المؤشرات الإحصائية (KPIs)؟',
    order_index: 2,
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 'q_pr1',
    committee_key: 'pr',
    question_text: 'كيف تقنع مدير تسويق شركة أدوية كبرى برعاية مؤتمر الطلاب بمبلغ 50,000 جنيه؟',
    order_index: 1,
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 'q_media1',
    committee_key: 'media',
    question_text: 'أرفق رابط معرض أعمالك (Behance / Drive / Portfolio) واذكر البرامج التي تتقنها.',
    order_index: 1,
    is_active: true,
    created_at: '2026-01-01'
  }
];

export const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app_301',
    applicant_name: 'مروان علاء الشربيني',
    phone: '+201099881122',
    email: 'marwan.alaa@gmail.com',
    faculty_level: 'الفرقة الثالثة — كلية الصيدلة',
    committee_key: 'data_analysis',
    committee_name: 'Data Analysis & Research',
    dynamic_answers: {
      'q_g1': 'Aliens هو الكيان الأقوى أكاديمياً وأرغب في توظيف مهاراتي في تحليل البيانات الصيدلانية لبناء لوحات تحكم للأبحاث.',
      'q_g2': 'أتبع جدول زمني صارم عبر تقنية Time Blocking وأخصص ساعات محددة يومياً للعمل الطلابي.',
      'q_data1': 'أتقن Excel المتقدم و Python (Pandas/Matplotlib) وقمت بتحليل نتائج استبيان لـ 300 مريض حول التفاعلات الدوائية.',
      'q_data2': 'عبر حساب معدل الارتداد، نسبة الحضور الفعلي للمسجلين، ودرجات تقييم المحتوى الصيدلاني بواسطة NPS.'
    },
    status: 'in_review',
    ir_status: 'accepted',
    ir_assignee_id: 'prof_ir_evaluator_1',
    ir_notes: 'طالب متميز وواثق من إجاباته ولديه خلفية إحصائية قوية.',
    committee_decision: 'pending',
    committee_notes: 'في انتظار المقابلة التقنية مع الـ Head.',
    shift_history: [],
    created_at: '2026-08-20',
    updated_at: '2026-08-22'
  },
  {
    id: 'app_302',
    applicant_name: 'ريم حسام الدين',
    phone: '+201066559988',
    email: 'reem.hossam@gmail.com',
    faculty_level: 'الفرقة الثانية — كلية الصيدلة',
    committee_key: 'pr',
    committee_name: 'Public Relations (PR)',
    dynamic_answers: {
      'q_g1': 'أريد تطوير مهاراتي في التفاوض وبناء علاقات مع كبرى شركات الأدوية.',
      'q_g2': 'تنظيم الأولويات والتركيز في المحاضرات صباحاً ثم العمل التطوعي مساءً.',
      'q_pr1': 'عرض باقة رعاية مخصصة تضمن ظهور العلامة التجارية أمام 800 صيدلي مستقبلي مع منصة حصرية للتحدث.'
    },
    status: 'accepted',
    ir_status: 'accepted',
    ir_assignee_id: 'prof_ir_evaluator_2',
    ir_notes: 'لباقة عالية وحضور قوي جداً في المقابلة الشخصية.',
    committee_decision: 'accepted',
    committee_notes: 'تم اعتماد القبول وإرسال كود الانضمام.',
    shift_history: [],
    created_at: '2026-08-18',
    updated_at: '2026-08-25'
  }
];

export const INITIAL_ACCESS_CODES: AccessCodeItem[] = [
  {
    id: 'code_data_head',
    code: 'ALIENS-DATA-HEAD-2026',
    target_role: 'head',
    committee_key: 'data_analysis',
    committee_position: 'Head',
    max_uses: 2,
    current_uses: 1,
    is_active: true,
    expires_at: '2026-12-31T23:59:59Z',
    created_by: 'prof_og_1',
    created_at: '2026-01-01'
  },
  {
    id: 'code_data_mem',
    code: 'ALIENS-DATA-MEMBER-99',
    target_role: 'member',
    committee_key: 'data_analysis',
    committee_position: 'Member',
    max_uses: 15,
    current_uses: 3,
    is_active: true,
    expires_at: '2026-12-31T23:59:59Z',
    created_by: 'prof_og_1',
    created_at: '2026-01-01'
  },
  {
    id: 'code_ir_eval',
    code: 'ALIENS-IR-EVALUATOR-77',
    target_role: 'ir_evaluator',
    committee_key: 'ir',
    committee_position: 'Member',
    max_uses: 5,
    current_uses: 2,
    is_active: true,
    expires_at: '2026-12-31T23:59:59Z',
    created_by: 'prof_og_1',
    created_at: '2026-01-01'
  }
];

export const INITIAL_IR_ASSIGNMENTS: IRAssignment[] = [
  {
    id: 'ir_asg_1',
    evaluator_id: 'prof_ir_evaluator_1',
    evaluator_name: 'أحمد سامي عبدالعزيز',
    member_id: 'prof_member_1',
    member_name: 'نور الدين مصطفى',
    member_committee: 'Media & Production',
    assigned_by: 'prof_og_1',
    status: 'active',
    assigned_at: '2026-03-05'
  },
  {
    id: 'ir_asg_2',
    evaluator_id: 'prof_ir_evaluator_2',
    evaluator_name: 'رنا وائل النجار',
    member_id: 'prof_member_data',
    member_name: 'حسن محمود بدر',
    member_committee: 'Data Analysis & Research',
    assigned_by: 'prof_og_1',
    status: 'active',
    assigned_at: '2026-03-05'
  },
  {
    id: 'ir_asg_3',
    evaluator_id: 'prof_ir_evaluator_1',
    evaluator_name: 'أحمد سامي عبدالعزيز',
    member_id: 'prof_member_pr',
    member_name: 'سلمى إبراهيم حبيب',
    member_committee: 'Public Relations (PR)',
    assigned_by: 'prof_og_1',
    status: 'active',
    assigned_at: '2026-03-05'
  }
];

export const INITIAL_EVALUATIONS: EvaluationItem[] = [
  {
    id: 'eval_aug_01',
    member_id: 'prof_member_data',
    member_name: 'حسن محمود بدر',
    member_committee: 'Data Analysis & Research',
    evaluator_id: 'prof_ir_evaluator_2',
    evaluator_name: 'رنا وائل النجار',
    evaluation_month: '2026-08',
    score: 96,
    criteria_scores: {
      commitment: 25,
      communication: 24,
      task_quality: 24,
      initiative: 23
    },
    notes: 'عضو استثنائي، أنجز تحليل بيانات المؤتمر قبل الموعد المحدد وقدم تقريراً إحصائياً دقيقاً.',
    created_at: '2026-08-25'
  },
  {
    id: 'eval_aug_02',
    member_id: 'prof_member_1',
    member_name: 'نور الدين مصطفى',
    member_committee: 'Media & Production',
    evaluator_id: 'prof_ir_evaluator_1',
    evaluator_name: 'أحمد سامي عبدالعزيز',
    evaluation_month: '2026-08',
    score: 91,
    criteria_scores: {
      commitment: 23,
      communication: 22,
      task_quality: 24,
      initiative: 22
    },
    notes: 'أداء ممتاز في مونتاج الفيديوهات الترويجية وحضور دائم في الاجتماعات.',
    created_at: '2026-08-25'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task_data_01',
    committee_key: 'data_analysis',
    title: 'بناء لوحة قياس الحضور لقمة PharmaTech 2026',
    description: 'تجميع بيانات المسجلين وتصنيفهم حسب الجامعات وسنوات الدراسة وتقديم تقرير مرئي للـ High Board.',
    assigned_to: 'prof_member_data',
    assigned_to_name: 'حسن محمود بدر',
    status: 'in_progress',
    due_date: '2026-09-05',
    created_by: 'prof_data_head',
    created_at: '2026-08-26'
  },
  {
    id: 'task_data_02',
    committee_key: 'data_analysis',
    title: 'تحليل استبيان الرضا بعد معسكر Onboarding Bootcamp',
    description: 'حساب متوسط درجات الرضا وتحديد النقاط المطلوب تحسينها في المعسكرات القادمة.',
    assigned_to: 'prof_data_sub',
    assigned_to_name: 'زياد حازم الشناوي',
    status: 'completed',
    due_date: '2026-08-20',
    created_by: 'prof_data_head',
    created_at: '2026-08-15'
  },
  {
    id: 'task_media_01',
    committee_key: 'media',
    title: 'تصميم البوسترات الرسمية لمؤتمر PharmaTech',
    description: 'تصميم 3 بوسترات بدقة عالية للطباعة والسوشيال ميديا متوافقة مع الهوية البصرية الفضائية للكيان.',
    assigned_to: 'prof_member_1',
    assigned_to_name: 'نور الدين مصطفى',
    status: 'completed',
    due_date: '2026-08-22',
    created_by: 'prof_og_1',
    created_at: '2026-08-10'
  },
  {
    id: 'task_pr_01',
    committee_key: 'pr',
    title: 'تأكيد رعاية شركة فاركو للأدوية للقمة',
    description: 'إرسال العقد النهائي وتحديد مكان الجناح الخاص بالشركة في المعرض.',
    assigned_to: 'prof_member_pr',
    assigned_to_name: 'سلمى إبراهيم حبيب',
    status: 'in_progress',
    due_date: '2026-09-01',
    created_by: 'prof_og_1',
    created_at: '2026-08-20'
  }
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_1',
    user_id: 'usr_og_1',
    author_name: 'د. أسامة ثروت الجوهري',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    memory_text: 'فخور جداً بما وصل إليه كيان Aliens اليوم، أكثر من 140 عضواً يعملون بشغف وإخلاص لخدمة طلبة الصيدلة وبناء مستقبل واعد للرعاية الصحية في مصر. القادم أعظم دائماً! 🚀💚',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
    likes_count: 68,
    user_liked: true,
    created_at: 'منذ يومين',
    comments: [
      {
        id: 'comm_mem_1',
        user_id: 'usr_data_1',
        author_name: 'عمر طارق النمر',
        comment_text: 'دائماً مصدر إلهامنا يا دكتور وكلنا فخر بالانتماء لهذه العائلة العظيمة!',
        created_at: 'منذ يوم'
      }
    ]
  },
  {
    id: 'mem_2',
    user_id: 'usr_mem_1',
    author_name: 'نور الدين مصطفى',
    memory_text: 'ليالي العمل المتواصلة في تجهيز فيديوهات المؤتمر مع فريق الميديا لا تُنسى.. شكراً لكل شخص تعب وشاركنا هذه اللحظات الملهمة.',
    likes_count: 34,
    user_liked: false,
    created_at: 'منذ 3 أيام',
    comments: []
  }
];

export const INITIAL_ALBUMS: GalleryAlbum[] = [
  {
    id: 'alb_1',
    title: 'PharmaTech Summit 2025 Highlights',
    description: 'أجمل لقطات المؤتمر السنوي السابق وتكريم كبار المحاضرين وشركاء النجاح.',
    cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    category: 'Conferences',
    photos_count: 24,
    images: [
      { id: 'img_1', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80', caption: 'كلمة الافتتاح لعميد الكلية', likes: 19 },
      { id: 'img_2', image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80', caption: 'جلسة الذكاء الاصطناعي في الفارماكولوجي', likes: 27 },
      { id: 'img_3', image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', caption: 'صورة جماعية لمجلس إدارة Aliens', likes: 45 }
    ],
    created_at: '2025-10-15'
  },
  {
    id: 'alb_2',
    title: 'Charity Medical Convoy — Delta Villages',
    description: 'توثيق القافلة العلاجية المجانية لخدمة أكثر من 1,200 مريض في قرى محافظة الدقهلية.',
    cover_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    category: 'Charity',
    photos_count: 18,
    images: [
      { id: 'img_4', image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80', caption: 'صرف الأدوية للمرضى بالمجان', likes: 32 }
    ],
    created_at: '2026-03-20'
  }
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_1',
    title: 'PharmaDosage: AI Clinical Calculator',
    author_name: 'عمر طارق & لجنة تحليل البيانات',
    committee: 'Data Analysis & Research',
    description: 'أداة رقمية ذكية لحساب جرعات المضادات الحيوية لمرضى القصور الكلوي بناءً على معادلة Cockcroft-Gault بدقة عالية.',
    tags: ['Clinical Pharmacy', 'AI Algorithms', 'Dosage Calculator'],
    link_url: 'https://pharmadosage.aliens-space.org',
    created_at: '2026-04-10'
  },
  {
    id: 'proj_2',
    title: 'Drug-Drug Interaction Matrix Explorer',
    author_name: 'حسن محمود & لجنة الـ PR',
    committee: 'Data Analysis & Research',
    description: 'قاعدة بيانات تفاعلية لاستكشاف التداخلات الدوائية الخطرة بين أدوية القلب ومضادات الاكتئاب.',
    tags: ['Pharmacology', 'Safety Matrix', 'Interactive Visuals'],
    created_at: '2026-05-18'
  }
];

export const INITIAL_INTERNSHIPS: InternshipItem[] = [
  {
    id: 'intern_1',
    company_name: 'Eva Pharma Egypt',
    role_title: 'Quality Assurance & Clinical Research Intern',
    location: '6th of October / Hybrid',
    duration: '2 Months (Summer 2026)',
    requirements: ['طلبة الفرقة 3 أو 4 صيدلة', 'تقدير عام جيد جداً', 'إتقان اللغة الإنجليزية'],
    apply_link: 'https://careers.evapharma.com',
    is_active: true,
    created_at: '2026-07-01'
  },
  {
    id: 'intern_2',
    company_name: 'Pharco Pharmaceuticals',
    role_title: 'Production & Formulation R&D Intern',
    location: 'Alexandria / Amriya Plant',
    duration: '6 Weeks',
    requirements: ['طلبة الصيدلة الإكلينيكية والعامة', 'شغف بالصناعات الدوائية الحديثة'],
    apply_link: 'https://pharco.org/internships',
    is_active: true,
    created_at: '2026-07-15'
  }
];

export const INITIAL_CULTURAL_RESOURCES: CulturalResource[] = [
  {
    id: 'res_1',
    title: 'مستقبل الذكاء الاصطناعي في تصميم الجزيئات الدوائية (Drug Discovery)',
    category: 'Scientific Article',
    author: 'لجنة تحليل البيانات والبحث الصيدلي',
    read_time: '5 دقائق',
    summary: 'كيف تساهم خوارزميات التعلم العميق في تقليص زمن اكتشاف الأدوية الجديدة من 10 سنوات إلى شهور معدودة.',
    content: 'يشهد القطاع الصيدلاني ثورة غير مسبوقة بفضل نماذج الذكاء الاصطناعي التوليدي القادرة على التنبؤ بطريقة طي البروتينات وتصميم مركبات كيميائية ترتبط بدقة بالمستقبلات الخلوية المستهدفة...',
    created_at: '2026-06-01'
  },
  {
    id: 'res_2',
    title: 'دليل الصيدلي الناجح في مهارات التفاوض وإدارة الصيدليات',
    category: 'Leadership',
    author: 'لجنة العلاقات العامة PR',
    read_time: '7 دقائق',
    summary: 'أسرار بناء علاقة ثقة وطيدة مع المريض وإدارة الأزمات والمخزون الصيدلي بحرفية.',
    content: 'التفوق العلمي وحده لا يكفي لبناء مسيرة صيدلانية لامعة، فالصيدلي قائد في بيئته الطبية يحتاج إلى فهم عميق لسيكولوجية المريض وإتقان فنون الاستماع والتواصل الفعال...',
    created_at: '2026-06-15'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud_1',
    actor_name: 'د. أسامة ثروت الجوهري',
    actor_role: 'OG',
    action: 'SYSTEM_BOOTSTRAP',
    entity_type: 'SYSTEM',
    details: 'تهيئة بيئة Aliens Space الإنتاجية وتفعيل قواعد RLS ونظام الصلاحيات الشامل.',
    created_at: '2026-08-28T09:00:00Z'
  },
  {
    id: 'aud_2',
    actor_name: 'أحمد سامي عبدالعزيز',
    actor_role: 'ir_head',
    action: 'IR_ASSIGNMENT',
    entity_type: 'IR',
    entity_id: 'prof_member_data',
    details: 'توزيع العضو حسن محمود بدر (لجنة تحليل البيانات) على المقيّم د. رنا وائل النجار.',
    created_at: '2026-08-28T10:15:00Z'
  },
  {
    id: 'aud_3',
    actor_name: 'د. أسامة ثروت الجوهري',
    actor_role: 'OG',
    action: 'ATTENDANCE_MARKED',
    entity_type: 'EVENT',
    entity_id: 'ev_pharmatech_2026',
    details: 'تسجيل حضور المسجل محمد عبدالله خليل وإصدار شهادة معتمدة بكود AS-CERT-8849-DELTA.',
    created_at: '2026-08-28T12:00:00Z'
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  certificate_signatory_name: 'Aliens High Board & Faculty Leadership',
  certificate_signatory_title: 'President & Dean of Faculty of Pharmacy',
  recruitment_open: true,
  contact_pr_phone: '+20 101 234 5678',
  contact_email: 'contact@aliens-space.org',
  hero_tagline: 'المنظومة الرقمية الرسمية لكيان Aliens — كلية الصيدلة، جامعة الدلتا للعلوم والتكنولوجيا',
  about_statement: 'كيان طلابي صيدلي رائد يسعى لتطوير المهارات العلمية والقيادية لطلبة الصيدلة وصناعة كوادر متميزة في صناعة الدواء والرعاية الصحية.',
  academic_lead_name: 'الأستاذ الدكتور / عميد كلية الصيدلة — جامعة الدلتا'
};
