/**
 * services/questions.js
 * Recruitment questions management (Add, Edit, Delete, Reorder, Enable/Disable, Preview).
 */
const QuestionsService = {
  async getQuestionsByCommittee(committeeKey) {
    if (!window.sb) return [];
    try {
      let query = window.sb.from('dynamic_questions').select('*');
      if (committeeKey && committeeKey !== 'all') {
        query = query.or(`committee_key.eq.${committeeKey},committee_key.eq.global`);
      }
      const { data, error } = await query.order('id', { ascending: true });
      if (error) {
        console.error("Error fetching dynamic questions:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn("QuestionsService query error:", e);
      return [];
    }
  },

  async getAllQuestions() {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('dynamic_questions')
      .select('*')
      .order('committee_key', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addQuestion(committeeKey, questionText, orderIndex = 0) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const payload = {
      committee_key: committeeKey.toLowerCase().trim(),
      question_text: questionText.trim()
    };
    const { data, error } = await window.sb
      .from('dynamic_questions')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateQuestion(id, updates) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.sb
      .from('dynamic_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteQuestion(id) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { error } = await window.sb
      .from('dynamic_questions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

window.QuestionsService = QuestionsService;
