# ALIENS SPACE — DATABASE CONTRACT & SCHEMA (PHASE 5)

This contract defines the Supabase data model, canonical tables, RPC functions, and relationships for the Aliens Space platform.

---

## 1. Canonical Database Schema

### 1.1 `profiles`
- **Columns**:
  - `id` (UUID, Primary Key, references `auth.users.id` ON DELETE CASCADE)
  - `full_name` (TEXT, required)
  - `username` (TEXT, UNIQUE, required)
  - `email` (TEXT, required)
  - `avatar_url` (TEXT, nullable)
  - `role` (TEXT: 'registered_user', 'member', 'ir_evaluator', 'head', 'sub_head', 'ir_head', 'ir_sub_head', 'team_head', 'team_sub_head', 'OG')
  - `committee_key` (TEXT: 'marketing', 'pr', 'media', 'ir', 'event_planning', 'secretary', 'charity', 'magic_hand', 'data_analysis', nullable)
  - `committee_position` (TEXT: 'Head', 'Sub Head', 'Member', nullable)
  - `assigned_ir` (UUID, references `profiles.id`, nullable)
  - `is_evaluator` (BOOLEAN, default false)
  - `phone` (TEXT, nullable)
  - `student_id` (TEXT, nullable)
  - `created_at` (TIMESTAMPTZ, default now())
  - `updated_at` (TIMESTAMPTZ, default now())
- **Frontend Service**: `services/profile.js`
- **Pages**: `profile.html`, `admin.html`, `enhancements.js` (header/sidebar).

---

### 1.2 `access_codes` (formerly `promo_codes`)
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `code` (TEXT, UNIQUE, uppercase)
  - `target_role` (TEXT)
  - `committee_key` (TEXT)
  - `committee_position` (TEXT)
  - `max_uses` (INT, default 1)
  - `current_uses` (INT, default 0)
  - `is_active` (BOOLEAN, default true)
  - `expires_at` (TIMESTAMPTZ, nullable)
  - `created_by` (UUID, references `profiles.id`)
  - `created_at` (TIMESTAMPTZ, default now())
- **Frontend Service**: `services/access_codes.js`
- **Pages**: `auth.html`, `profile.html`, `admin.html`.

---

### 1.3 `access_code_redemptions`
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `code_id` (BIGINT, references `access_codes.id`)
  - `user_id` (UUID, references `profiles.id`)
  - `redeemed_at` (TIMESTAMPTZ, default now())
- **Constraint**: UNIQUE(`code_id`, `user_id`) to prevent duplicate redemption.

---

### 1.4 `dynamic_questions`
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `committee_key` (TEXT: 'global', 'marketing', 'pr', 'media', 'ir', 'event_planning', 'secretary', 'charity', 'magic_hand', 'data_analysis')
  - `question_text` (TEXT, required)
  - `order_index` (INT, default 0)
  - `is_active` (BOOLEAN, default true)
  - `created_at` (TIMESTAMPTZ, default now())
- **Frontend Service**: `services/questions.js`
- **Pages**: `index.html` (Application Modal), `admin.html`.

---

### 1.5 `applications`
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `applicant_name` (TEXT, required)
  - `phone` (TEXT, required)
  - `email` (TEXT, nullable)
  - `faculty_level` (TEXT, required)
  - `committee_key` (TEXT, required)
  - `committee_name` (TEXT, required)
  - `dynamic_answers` (JSONB, required)
  - `question_snapshots` (JSONB, nullable)
  - `status` (TEXT: 'new', 'in_review', 'accepted', 'rejected', 'shifted', default 'new')
  - `ir_status` (TEXT: 'pending', 'accepted', 'rejected', default 'pending')
  - `ir_assignee_id` (UUID, references `profiles.id`, nullable)
  - `ir_notes` (TEXT, nullable)
  - `committee_decision` (TEXT: 'pending', 'accepted', 'rejected', 'shifted', default 'pending')
  - `committee_notes` (TEXT, nullable)
  - `shift_history` (JSONB, default '[]')
  - `created_at` (TIMESTAMPTZ, default now())
  - `updated_at` (TIMESTAMPTZ, default now())
- **Frontend Service**: `services/applications.js`
- **Pages**: `index.html` (Application modal), `admin.html`.

---

### 1.6 `ir_assignments`
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `evaluator_id` (UUID, references `profiles.id`)
  - `member_id` (UUID, references `profiles.id`)
  - `assigned_by` (UUID, references `profiles.id`)
  - `status` (TEXT: 'active', 'reassigned', 'completed', default 'active')
  - `assigned_at` (TIMESTAMPTZ, default now())
- **Constraints**: Evaluator active count <= 30.
- **Frontend Service**: `services/ir.js`
- **Pages**: `admin.html`.

---

### 1.7 `performance_evaluations`
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `member_id` (UUID, references `profiles.id`)
  - `evaluator_id` (UUID, references `profiles.id`)
  - `evaluation_month` (TEXT, e.g. '2026-08')
  - `score` (NUMERIC(5,2), 0 - 100)
  - `notes` (TEXT)
  - `created_at` (TIMESTAMPTZ, default now())
- **Constraint**: UNIQUE(`member_id`, `evaluation_month`)
- **Frontend Service**: `services/evaluations.js`
- **Pages**: `profile.html`, `admin.html`.

---

### 1.8 `events`
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `title` (TEXT, required)
  - `description` (TEXT, required)
  - `image_url` (TEXT, nullable)
  - `action_link` (TEXT, nullable)
  - `committee_key` (TEXT, nullable)
  - `category` (TEXT, default 'general')
  - `is_public` (BOOLEAN, default true)
  - `is_published` (BOOLEAN, default true)
  - `capacity` (INT, nullable)
  - `whatsapp_group_url` (TEXT, nullable)
  - `certificate_enabled` (BOOLEAN, default false)
  - `event_date` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ, default now())
- **Frontend Service**: `services/events.js`
- **Pages**: `events.html`, `index.html`, `admin.html`.

---

### 1.9 `event_registrations`
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `event_id` (BIGINT, references `events.id` ON DELETE CASCADE)
  - `user_id` (UUID, references `profiles.id`, nullable for guest)
  - `registrant_name` (TEXT, required)
  - `phone` (TEXT, required)
  - `email` (TEXT, nullable)
  - `ticket_code` (TEXT, UNIQUE, required)
  - `attendance_status` (TEXT: 'registered', 'attended', 'not_completed', default 'registered')
  - `attendance_marked_by` (UUID, references `profiles.id`, nullable)
  - `attendance_marked_at` (TIMESTAMPTZ, nullable)
  - `created_at` (TIMESTAMPTZ, default now())
- **Frontend Service**: `services/attendance.js`
- **Pages**: `events.html`, `admin.html`.

---

### 1.10 `certificates`
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `event_id` (BIGINT, references `events.id`)
  - `registration_id` (BIGINT, references `event_registrations.id`, UNIQUE)
  - `recipient_name` (TEXT, required from original registration)
  - `user_id` (UUID, references `profiles.id`, nullable)
  - `verification_code` (TEXT, UNIQUE, required)
  - `signatory_title` (TEXT, from site settings)
  - `signatory_name` (TEXT, from site settings)
  - `issued_at` (TIMESTAMPTZ, default now())
- **Frontend Service**: `services/certificates.js`
- **Pages**: `events.html`, `profile.html`, `admin.html`.

---

### 1.11 `tasks` (Committee Workspace Tasks)
- **Columns**:
  - `id` (BIGINT, Primary Key)
  - `committee_key` (TEXT, required)
  - `title` (TEXT, required)
  - `description` (TEXT, nullable)
  - `assigned_to` (UUID, references `profiles.id`, nullable)
  - `due_date` (TIMESTAMPTZ, nullable)
  - `status` (TEXT: 'todo', 'in_progress', 'completed', default 'todo')
  - `created_by` (UUID, references `profiles.id`)
  - `created_at` (TIMESTAMPTZ, default now())
- **Frontend Service**: `services/tasks.js`
- **Pages**: `admin.html`, `profile.html`.

---

### 1.12 `gallery_images` & `gallery_likes`
- **Frontend Service**: `services/gallery.js`
- **Pages**: `gallery.html`, `admin.html`.

---

### 1.13 `memories`, `memory_likes`, `memory_comments`
- **Frontend Service**: `services/memories.js`
- **Pages**: `memories.html`, `admin.html`.

---

### 1.14 `member_projects`, `internships`, `cultural_resources`, `site_settings`
- **Frontend Service**: `services/settings.js`, `services/analytics.js`
- **Pages**: `projects.html`, `internships.html`, `cultural.html`, `index.html`, `admin.html`.
