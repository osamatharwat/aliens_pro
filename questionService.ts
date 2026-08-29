import { supabase } from '../lib/supabase';
import { DynamicQuestion, Profile } from '../types';
import { auditService } from './auditService';

export const DEFAULT_QUESTIONS: DynamicQuestion[] = [
  // Global / General
  {
    id: 'q_g_1',
    committee_key: 'global',
    question_text: 'لماذا اخترت الانضمام إلى كيان Aliens Space وما هي أهدافك معنا؟',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'q_g_2',
    committee_key: 'global',
    question_text: 'كيف تنظم وقتك بين دراستك الأكاديمية والأنشطة الطلابية التطوعية؟',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // IR Questions
  {
    id: 'q_ir_1',
    committee_key: 'ir',
    question_text: 'كيف تتصرف إذا نشب خلاف شخصي بين عضوين في نفس الفريق خلال تنظيم فعالية هامة؟',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'q_ir_2',
    committee_key: 'ir',
    question_text: 'ما هي معاييرك لتقييم أداء عضو غير ملتزم بالمواعيد المحددة للتسليم؟',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Marketing
  {
    id: 'q_mkt_1',
    committee_key: 'marketing',
    question_text: 'كيف تصمم حملة تسويقية لجذب 1000 طالب لحضور مؤتمر طبي جديد؟',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // PR
  {
    id: 'q_pr_1',
    committee_key: 'pr',
    question_text: 'كيف تتواصل مع شركة راعية وترقنعهم بتمويل مؤتمر سنوي للطلاب؟',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Media
  {
    id: 'q_med_1',
    committee_key: 'media',
    question_text: 'ما هي البرامج التي تجيدها في المونتاج والتصميم؟ اذكر روابط لأعمالك السابقة.',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Event Planning
  {
    id: 'q_ep_1',
    committee_key: 'event_planning',
    question_text: 'كيف تتصرف إذا تأخر المحاضر الرئيسي عن موعده 45 دقيقة والقاعة ممتلئة؟',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Secretary
  {
    id: 'q_sec_1',
    committee_key: 'secretary',
    question_text: 'ما هي خبرتك في برامج Microsoft Excel وتوثيق محاضر الاجتماعات الرسمية؟',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Charity
  {
    id: 'q_ch_1',
    committee_key: 'charity',
    question_text: 'ما هي أفكارك المبتكرة لتنظيم قافلة طبية توعوية في منطقة نائية؟',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Magic Hand
  {
    id: 'q_mh_1',
    committee_key: 'magic_hand',
    question_text: 'ما هي المهارات الفنية واليدوية التي تجيدها في الديكور وإعادة التدوير؟',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  // Data Analysis
  {
    id: 'q_da_1',
    committee_key: 'data_analysis',
    question_text: 'ما هي الأدوات واللغات التي تستخدمها لتحليل البيانات (Excel, PowerBI, Python, SQL)؟',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'q_da_2',
    committee_key: 'data_analysis',
    question_text: 'كيف تستخرج رؤى واضحة (Actionable Insights) من استبيان حضور فعالية به 500 استجابة؟',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const questionService = {
  /**
   * Get all dynamic questions
   */
  async getAllQuestions(): Promise<DynamicQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('dynamic_questions')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(q => ({
          id: String(q.id),
          committee_key: q.committee_key,
          question_text: q.question_text,
          order_index: q.order_index || 0,
          is_active: q.is_active !== false,
          created_at: q.created_at || new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('getAllQuestions exception:', e);
    }

    return DEFAULT_QUESTIONS;
  },

  /**
   * Get questions for a specific committee (including global questions)
   */
  async getQuestionsByCommittee(committeeKey: string): Promise<DynamicQuestion[]> {
    const all = await this.getAllQuestions();
    return all.filter(
      q => q.is_active && (q.committee_key === committeeKey || q.committee_key === 'global')
    );
  },

  /**
   * Create dynamic question
   */
  async createQuestion(questionData: Partial<DynamicQuestion>, actor: Profile): Promise<DynamicQuestion> {
    const newQ = {
      committee_key: questionData.committee_key || 'global',
      question_text: questionData.question_text,
      order_index: questionData.order_index || 1,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('dynamic_questions')
      .insert([newQ])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل إضافة السؤال الجديد.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'CREATE_QUESTION',
      entity_type: 'dynamic_questions',
      entity_id: String(data.id),
      details: `إضافة سؤال جديد للجنة ${data.committee_key}`
    });

    return {
      id: String(data.id),
      committee_key: data.committee_key,
      question_text: data.question_text,
      order_index: data.order_index,
      is_active: data.is_active,
      created_at: data.created_at
    };
  },

  /**
   * Update question text or order
   */
  async updateQuestion(id: string, updates: Partial<DynamicQuestion>, actor: Profile): Promise<DynamicQuestion> {
    const { data, error } = await supabase
      .from('dynamic_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'فشل تعديل السؤال.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'UPDATE_QUESTION',
      entity_type: 'dynamic_questions',
      entity_id: id,
      details: `تعديل السؤال`
    });

    return {
      id: String(data.id),
      committee_key: data.committee_key,
      question_text: data.question_text,
      order_index: data.order_index,
      is_active: data.is_active,
      created_at: data.created_at
    };
  },

  /**
   * Delete or deactivate question
   */
  async deleteQuestion(id: string, actor: Profile): Promise<void> {
    const { error } = await supabase
      .from('dynamic_questions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'فشل حذف السؤال.');
    }

    await auditService.logAction({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'DELETE_QUESTION',
      entity_type: 'dynamic_questions',
      entity_id: id,
      details: `حذف السؤال`
    });
  }
};
