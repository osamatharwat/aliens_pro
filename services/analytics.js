/**
 * services/analytics.js
 * Platform analytics and safe event tracking.
 */
const AnalyticsService = {
  async recordEvent(eventName, meta = {}) {
    if (!window.sb) return;
    try {
      const payload = {
        event_name: eventName,
        page_name: (document.body?.dataset?.page || window.location.pathname).toLowerCase(),
        meta: JSON.stringify(meta || {}),
        user_id: window._cachedContext?.session?.user?.id || null,
        created_at: new Date().toISOString()
      };
      await window.sb.from('analytics_events').insert([payload]);
    } catch (e) {
      // Non-blocking telemetry
    }
  }
};

window.AnalyticsService = AnalyticsService;
