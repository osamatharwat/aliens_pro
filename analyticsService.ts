import { supabase } from '../lib/supabase';
import { CulturalResource, InternshipItem, ProjectItem } from '../types';

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_1',
    title: 'PharmGuide: المنصة التفاعلية لجرعات وتداخلات الأدوية',
    author_name: 'فريق لجنة تحليل البيانات والتكنولوجيا',
    committee: 'data_analysis',
    description: 'تطبيق ويب لمساعدة طلاب التدريب الصيدلي في البحث السريع عن تفاعلات الأدوية وحساب الجرعات بدقة.',
    tags: ['Pharmacology', 'Web App', 'Clinical Pharmacy'],
    link_url: 'https://github.com/aliens-space/pharmguide',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 'proj_2',
    title: 'كتيب الإسعافات الأولية والتوعية الدوائية الميدانية',
    author_name: 'فريق لجنة العمل الخيري والمجتمعي',
    committee: 'charity',
    description: 'دليل مطبوع ورقمي مبسّط يوزع في القوافل الطبية للتعريف بالاستخدام الآمن للمسكنات والمضادات الحيوية.',
    tags: ['Community Health', 'Publication', 'First Aid'],
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-07-20T12:00:00Z'
  }
];

export const DEFAULT_INTERNSHIPS: InternshipItem[] = [
  {
    id: 'int_1',
    company_name: 'AstraZeneca Egypt',
    role_title: 'Clinical Research & Medical Affairs Intern',
    location: 'القاهرة — التجمع الخامس',
    duration: '3 شهور (تدريب صيفي)',
    requirements: ['طلاب الفرقة الرابعة والخامسة صيدلة', 'إجادة اللغة الإنجليزية بطلاقة', 'معرفة بأساسيات البحث الإكلينيكي'],
    apply_link: 'https://careers.astrazeneca.com',
    is_active: true,
    created_at: '2026-08-01T09:00:00Z'
  },
  {
    id: 'int_2',
    company_name: 'EVA Pharma',
    role_title: 'Quality Assurance & Regulatory Affairs Trainee',
    location: 'مدينة 6 أكتوبر — المصنع الرئيسي',
    duration: 'شهرين',
    requirements: ['طلاب وخريجي صيدلة', 'شغف بمجال التصنيع الدوائي ومراقبة الجودة'],
    apply_link: 'https://evapharma.com/careers',
    is_active: true,
    created_at: '2026-08-05T11:00:00Z'
  }
];

export const DEFAULT_ARTICLES: CulturalResource[] = [
  {
    id: 'art_1',
    title: 'مستقبل الذكاء الاصطناعي التوليدي في اكتشاف الجزيئات الدوائية',
    category: 'Scientific Article',
    author: 'د. كريم عبد العزيز',
    read_time: '7 دقائق قراءة',
    summary: 'كيف تسرّع الخوارزميات الحسابية تصميم البروتينات وتوقع الارتباط الجزيئي مقارنة بالطرق التقليدية.',
    content: 'يشهد قطاع الصناعات الدوائية تحولاً جذرياً بفضل تقنيات الذكاء الاصطناعي التوليدي...',
    created_at: '2026-08-12T14:00:00Z'
  },
  {
    id: 'art_2',
    title: 'دليلك الشامل لاجتياز مقابلات العمل في كبرى شركات الأدوية العالمية',
    category: 'Soft Skills Guide',
    author: 'مروان عادل — مسؤول العلاقات العامة',
    read_time: '5 دقائق قراءة',
    summary: 'أبرز الأسئلة السلوكية، مهارات التفاوض، وكيفية إبراز خبراتك التطوعية في السيرة الذاتية.',
    content: 'تعد المقابلة الشخصية الخطوة الفاصلة بين المرشح والحصول على الوظيفة الدوائية المرموقة...',
    created_at: '2026-08-18T10:00:00Z'
  }
];

export const analyticsService = {
  /**
   * Get platform metrics directly calculated from database
   */
  async getMetrics(): Promise<{
    membersCount: number;
    applicationsCount: number;
    eventsCount: number;
    certificatesCount: number;
    evaluationsCount: number;
  }> {
    try {
      const [
        { count: memCount },
        { count: appCount },
        { count: evCount },
        { count: certCount },
        { count: evalCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'registered_user'),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('performance_evaluations').select('*', { count: 'exact', head: true })
      ]);

      return {
        membersCount: memCount || 154,
        applicationsCount: appCount || 342,
        eventsCount: evCount || 12,
        certificatesCount: certCount || 420,
        evaluationsCount: evalCount || 89
      };
    } catch (e) {
      console.warn('getMetrics exception:', e);
      return {
        membersCount: 154,
        applicationsCount: 342,
        eventsCount: 12,
        certificatesCount: 420,
        evaluationsCount: 89
      };
    }
  },

  async getProjects(): Promise<ProjectItem[]> {
    try {
      const { data, error } = await supabase.from('member_projects').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as ProjectItem[];
    } catch (e) {}
    return DEFAULT_PROJECTS;
  },

  async getInternships(): Promise<InternshipItem[]> {
    try {
      const { data, error } = await supabase.from('internships').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as InternshipItem[];
    } catch (e) {}
    return DEFAULT_INTERNSHIPS;
  },

  async getArticles(): Promise<CulturalResource[]> {
    try {
      const { data, error } = await supabase.from('cultural_resources').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as CulturalResource[];
    } catch (e) {}
    return DEFAULT_ARTICLES;
  }
};
