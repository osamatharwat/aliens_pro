# ALIENS SPACE — CHECKPOINT AUDIT (PHASE 0)

## 1. Existing Pages Identified
- **index.html**: Homepage with Aliens orbit overview, hero section, statistics, achievements, quick links, sponsor WhatsApp connect, and recruitment trigger.
- **events.html**: Public events feed and registration entry points.
- **gallery.html**: Visual gallery with categorized image grid and live heart/like interactions.
- **committees.html**: 8 legacy committees listed (Marketing, Media, PR, IR, Magic Hand, Charity, Secretary, Event Planning) + Data Analysis committee evolution.
- **memories.html**: Wall of memories with text posting, optional photo upload, likes counter, and comments.
- **projects.html**: Members projects showcase with direct WhatsApp link & portfolio URL.
- **cultural.html**: Medical and developmental cultural resource hub with external links & premium flags.
- **internships.html**: Partner internship listings with direct application links.
- **cv.html**: CV Builder v5 with live preview, ATS compatibility analysis, multiple templates, and PDF export.
- **auth.html**: Authentication portal supporting login, signup (with promo code), and password reset.
- **profile.html**: Member profile page with avatar upload, username/name update, password update, and monthly performance evaluation history.
- **admin.html**: Leadership dashboard with dynamic questions management, members management, applications review, IR interviews, monthly performance evaluations, events, internships, projects, and site settings.

## 2. Existing Features
- Multilingual i18n support (Arabic / English) with direction switching (RTL / LTR).
- Real-time Supabase Auth with session persistence and avatar storage.
- Dynamic Committee Recruitment modal with committee-specific questions fetched live from Supabase.
- IR Interview and Assignment system (assignee ID, notes, statuses).
- Monthly performance evaluation review (scores 0-100 and month tracking).
- Live Realtime subscriptions for new gallery images, internships, cultural resources, and member projects.
- Gallery like counter and individual user like toggles.
- Memory likes & comment threads.
- WhatsApp PR leadership integration based on database site settings.

## 3. Existing Services & Scripts
- `core.js`: Supabase client initialization, auth context cache, image upload helpers, toast notifications, realtime listener setup.
- `enhancements.js`: Navigation shell rendering, sidebar layout, responsive drawer, i18n translation dictionary, language switcher.
- `app.js`: Recruitment state check, application submission form modal, gallery rendering, memory form & feed rendering, WhatsApp sync.
- `admin.js`: Administrative panel rendering for profiles, applications, IR dashboard, performance, dynamic questions, gallery, and site settings.
- `profile.js`: User profile management, avatar upload to Supabase Storage bucket, and performance evaluation history display.

## 4. Existing Data Sources & Supabase Tables Referenced
- `profiles` (id, full_name, username, email, role, committee, committee_key, position, committee_position, avatar_url, assigned_ir, updated_at)
- `site_settings` (setting_key, setting_value)
- `events` (id, title, description, image_url, action_link, created_at)
- `gallery_images` (id, section_name, image_url, created_at)
- `gallery_likes` (id, image_name, user_id, created_at)
- `memories` (id, user_id, author_name, memory_text, image_url, is_approved, created_at)
- `memory_likes` (id, memory_id, user_id, created_at)
- `memory_comments` (id, memory_id, user_id, author_name, comment_text, created_at)
- `member_projects` (id, user_id, project_title, description, contact_phone, social_link, project_link, image_url, created_at)
- `internships` (id, company_name, title, description, apply_link, image_url, created_at)
- `cultural_resources` (id, section_name, title, resource_url, is_premium_only, created_at)
- `dynamic_questions` (id, committee_key, question_text, created_at)
- `applications` (id, applicant_name, phone, faculty_level, committee_key, committee_name, dynamic_answers, role_requested, status, ir_decision, ir_status, ir_assignee_id, decision_note, committee_decision, created_at)
- `performance_evaluations` (id, member_id, evaluator_id, evaluation_month, score, notes, created_at)
- `promo_codes` (id, code, role, committee_key, committee_position, is_active, current_uses, max_uses, created_at)

## 5. Existing Auth & Admin Flows
- **Auth Flow**: `supabase.auth.signUp()` with metadata, followed by profile update. Client-side promo code redemption.
- **Admin Flow**: Role-based access (`head`, `OG`, `ir`, `hr`). Super Admins see all management cards; IR sees interview list and performance evaluations.

## 6. Known Bugs & Legacy Architecture Identified
1. **Client-Side Role Upgrades**: On signup, the client was performing an update to `profiles` table to assign roles/committees. This violates server-authoritative security.
2. **Access Codes**: Promo codes were incremented on client-side RPC/update instead of a secure server-enforced atomic RPC (`redeem_access_code`).
3. **Missing Committees**: "Data Analysis" committee was not included in the hardcoded dropdowns.
4. **Scattered Database Queries**: Direct `window.sb.from(...)` queries scattered inside UI handlers and rendering methods without a unified service layer.
5. **Lack of Event Attendance & Certificate Issuance Entities**: Events lacked dedicated `event_registrations`, `event_attendance`, and `certificates` database tables with cryptographic verification codes.
6. **IR Evaluator Load Constraints**: IR assignment lacked capacity checks (1-30 active members per evaluator).
7. **Committee Head Permissions**: Committee Heads must strictly manage their own committee questions, applications, and evaluations, while Team Head / OG has global scope.
