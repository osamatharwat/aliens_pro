import { supabase } from '../lib/supabase';
import { AuditLogItem } from '../types';

export const auditService = {
  /**
   * Fetch recent audit logs (Leadership view)
   */
  async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        return data.map(log => ({
          id: String(log.id),
          actor_name: log.actor_name || 'مسؤول النظام',
          actor_role: log.actor_role || 'OG',
          actor_id: log.actor_id || undefined,
          action: log.action || 'OPERATION',
          entity_type: log.entity_type || 'SYSTEM',
          entity_id: log.entity_id || undefined,
          details: log.details || '',
          created_at: log.created_at || new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('getAuditLogs exception:', e);
    }
    return [];
  },

  /**
   * Record an action in the audit log
   */
  async logAction(log: Partial<AuditLogItem>): Promise<void> {
    try {
      const payload = {
        actor_name: log.actor_name || 'مستخدم',
        actor_role: log.actor_role || 'registered_user',
        actor_id: log.actor_id || null,
        action: log.action || 'GENERIC_ACTION',
        entity_type: log.entity_type || 'SYSTEM',
        entity_id: log.entity_id || null,
        details: log.details || '',
        created_at: new Date().toISOString()
      };

      await supabase
        .from('audit_logs')
        .insert([payload]);
    } catch (e) {
      console.warn('Audit logging failed non-blockingly:', e);
    }
  }
};
