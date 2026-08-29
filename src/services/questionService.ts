import { supabase } from '../lib/supabase';
import { DynamicQuestion, Profile } from '../types';
import { auditService } from './auditService';

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

      if (error) {
        console.warn('getAllQuestions error:', error);
        return [];
      }

      if (data && data.length > 0) {
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

    return [];
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
      question_text: questionData.question_text?.trim(),
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
