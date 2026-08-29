import { supabase } from '../lib/supabase';
import { CulturalResource, InternshipItem, ProjectItem } from '../types';

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
        { count: memCount, error: memErr },
        { count: appCount, error: appErr },
        { count: evCount, error: evErr },
        { count: certCount, error: certErr },
        { count: evalCount, error: evalErr }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'registered_user'),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('performance_evaluations').select('*', { count: 'exact', head: true })
      ]);

      if (memErr) console.warn('Metrics profiles count error:', memErr);
      if (appErr) console.warn('Metrics applications count error:', appErr);
      if (evErr) console.warn('Metrics events count error:', evErr);
      if (certErr) console.warn('Metrics certs count error:', certErr);
      if (evalErr) console.warn('Metrics evals count error:', evalErr);

      return {
        membersCount: memCount || 0,
        applicationsCount: appCount || 0,
        eventsCount: evCount || 0,
        certificatesCount: certCount || 0,
        evaluationsCount: evalCount || 0
      };
    } catch (e) {
      console.warn('getMetrics exception:', e);
      return {
        membersCount: 0,
        applicationsCount: 0,
        eventsCount: 0,
        certificatesCount: 0,
        evaluationsCount: 0
      };
    }
  },

  async getProjects(): Promise<ProjectItem[]> {
    try {
      const { data, error } = await supabase.from('member_projects').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as ProjectItem[];
    } catch (e) {}
    return [];
  },

  async getInternships(): Promise<InternshipItem[]> {
    try {
      const { data, error } = await supabase.from('internships').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as InternshipItem[];
    } catch (e) {}
    return [];
  },

  async getArticles(): Promise<CulturalResource[]> {
    try {
      const { data, error } = await supabase.from('cultural_resources').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as CulturalResource[];
    } catch (e) {}
    return [];
  }
};
