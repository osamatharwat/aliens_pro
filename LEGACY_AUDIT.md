# ALIENS SPACE — LEGACY CODE AUDIT (PHASE 2)

## 1. Storage & State Management Findings
- **LocalStorage Usage**:
  - `aliens_lang`: UI display language preference ('ar' / 'en'). Safe for local UI state.
  - `aliens_role`: Legacy cached role string. Must NOT be trusted for authorization.
  - `ALIENS_CVB_V5`: Local CV builder working draft. Safe for client-side CV editing.
- **SessionStorage Usage**:
  - `welcome_toast_shown`: One-time toast flag per session. Safe for UI state.
- **Mock & Fallback Data**:
  - Hardcoded fallback link `https://forms.gle/YourActualStudentFormLink`. Should be replaced with live Supabase `site_settings` retrieval.

## 2. Direct Supabase Calls from UI Components
- Direct `window.sb.from(...)` found in:
  - `app.js`: Application form submission, gallery likes, memory likes and comments, events/projects/internships/cultural queries.
  - `admin.js`: Profiles updates, application status updates, dynamic questions queries, performance evaluation queries.
  - `profile.js`: Profile updates, evaluations queries.
- **Remediation**: Encapsulate all database operations within the standardized `services/` layer (`services/auth.js`, `services/profile.js`, `services/applications.js`, `services/events.js`, `services/attendance.js`, `services/certificates.js`, `services/ir.js`, `services/evaluations.js`, `services/questions.js`, `services/tasks.js`, `services/gallery.js`, `services/memories.js`, `services/settings.js`, `services/access_codes.js`, `services/analytics.js`).

## 3. Role Checks & Permission Logic
- Legacy role checking in `enhancements.js`, `admin.js`, and `core.js` had inconsistencies (`head`, `OG`, `ir`, `hr`, `member`).
- **Canonical Model Enforced**:
  - `OG` / `Team Head` / `Team Sub Head`: Board Leadership with global oversight.
  - `Committee Head` / `Committee Sub Head`: Board Leadership over their assigned committee.
  - `IR Head` / `IR Sub Head`: Leadership over IR operations, evaluator assignment, and evaluations.
  - `IR Evaluator`: Member with evaluator privileges (only evaluations assigned to them).
  - `Member`: Permitted tasks, personal profile, personal evaluations, team workspaces.
  - `Registered User`: Default signup state before access code redemption.

## 4. Hardcoded Records & Placeholder URLs
- PR contact numbers (`01xxxxxxxxx`) in `site_settings` default templates.
- Social links (`https://www.facebook.com/Aliens.delta`, `https://www.instagram.com/aliens.du1`, `https://www.linkedin.com/in/aliens-delta-063993243`).
- **Remediation**: Allow dynamic management through `site_settings` and database-backed configuration.

## 5. Security & Silent Catches
- Silent catch blocks in analytics, like counters, and promo code RPCs.
- **Remediation**: Added structured error logging, user-friendly notifications via `showToast`, and safe async wrappers with retry and fallback UI indicators.
