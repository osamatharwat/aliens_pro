# ALIENS SPACE — CANONICAL DATABASE CONTRACT
**Architecture Version:** 4.0.0 (Clean-Slate Canonical Architecture)  
**System Target:** Supabase PostgreSQL 15+  
**Zero-Legacy Directive:** Clean normalized relational schema (`public.*`), zero legacy tables/views, zero client-side privilege escalation, zero mock data.

---

## 1. Executive Architecture & Authority Model

Aliens Space operates on an authoritative relational model where the database enforces access boundaries, organizational hierarchy, interview assignments, monthly evaluations, event attendance verification, and tamper-proof certificate issuance.

```
                                 ┌───────────────────────────┐
                                 │         OG / Admin        │
                                 │ (Global Admin Authority)  │
                                 └─────────────┬─────────────┘
                                               │
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                       THE BOARD                         │
                  │                                                         │
                  │  ┌───────────────────────┐     ┌──────────────────────┐ │
                  │  │         head          │     │       sub_head       │ │
                  │  │ (Head of Committee X) │     │ (Sub-Head of Comm. X)│ │
                  │  └───────────┬───────────┘     └──────────┬───────────┘ │
                  └──────────────┼────────────────────────────┼─────────────┘
                                 │                            │
                                 ▼                            ▼
                   ┌────────────────────────────────────────────────────────┐
                   │             COMMITTEE_MEMBERSHIPS BOUNDARY             │
                   │ - Governs only Committee X applications, questions,    │
                   │   tasks, and member performance.                       │
                   │ - Strictly isolated from Committee Y.                  │
                   └─────────────────────────────┬──────────────────────────┘
                                                 │
                                ┌────────────────┴────────────────┐
                                ▼                                 ▼
                     ┌─────────────────────┐           ┌───────────────────────┐
                     │    ir_evaluator     │           │        member         │
                     │ (Internal Relations)│           │ (Active Contributor)  │
                     └─────────────────────┘           └───────────────────────┘
                                                                  ▲
                                                                  │ (Access Code)
                                                       ┌──────────┴────────────┐
                                                       │    registered_user    │
                                                       └───────────────────────┘
```

### Core Hierarchy Principles
1. **Board Equivalence**: `Board Head = Committee Head` (`role = 'head'`). `Board Sub-Head = Committee Sub-Head` (`role = 'sub_head'`). There are no redundant `team_head`, `team_sub_head`, `ir_head`, or `ir_sub_head` roles.
2. **Relational Committee Identity**: Committee membership and leadership are strictly derived from `public.committee_memberships` (`user_id`, `committee_id`, `membership_role`). No `profiles.committee_key` shortcut exists as an authoritative source.
3. **Independent IR Systems**: 
   - **Member IR**: `public.ir_member_assignments` distributes active members to evaluators with a hard database-enforced limit of 30 active members per evaluator.
   - **Applicant IR**: `public.ir_applicant_assignments` assigns new recruitment applications to evaluators for interviews.
4. **Server-Side Enforcement**: All critical operations (code redemption, application submission, IR assignments, attendance certification, certificate issuance, photo/memory likes) are protected via atomic `SECURITY DEFINER` functions with `SET search_path = public, pg_temp`.

---

## 2. Canonical Database Entities

| Entity / Table | Primary Key | Description & Integrity Rules |
| :--- | :--- | :--- |
| `public.profiles` | `id UUID` (PK -> auth.users) | User profiles with role, username, bio, and evaluator flag. |
| `public.committees` | `id UUID` (PK), `key TEXT` (UQ) | Canonical list of committees with order index, active status, and metadata. |
| `public.committee_memberships` | `id UUID` (PK) | Relational membership table with composite unique `(user_id, committee_id)` and membership role. |
| `public.access_codes` | `id UUID` (PK) | Single-use/multi-use cryptographic promotion codes minted by OG. |
| `public.access_code_redemptions` | `id UUID` (PK) | Immutable audit of which user redeemed which code (`(code_id, user_id)` UNIQUE). |
| `public.dynamic_questions` | `id UUID` (PK) | Committee recruitment questions managed strictly by committee leadership, or global questions by OG. |
| `public.applications` | `id UUID` (PK) | Public applicant submissions with question snapshots and workflow status. |
| `public.ir_member_assignments` | `id UUID` (PK) | Authoritative assignment of active members to IR evaluators (max 30 active load). |
| `public.ir_applicant_assignments`| `id UUID` (PK) | Assignment of applicant interviews to IR evaluators. |
| `public.performance_evaluations` | `id UUID` (PK) | Monthly evaluations with criteria scores (composite unique `[member_id, evaluation_month]`). |
| `public.events` | `id UUID` (PK) | Public and internal workshops, hackathons, and conferences. |
| `public.event_registrations` | `id UUID` (PK) | Registrations with ticket codes and authenticated attendance markers. |
| `public.certificates` | `id UUID` (PK) | Cryptographically verifiable certificates issued exclusively for `attended` status. |
| `public.tasks` | `id UUID` (PK) | Committee-scoped tasks assigned to active members. |
| `public.memories` | `id UUID` (PK) | Community feed items posted by authenticated members. |
| `public.memory_likes` | `id UUID` (PK) | Relational 1-per-user like registry preventing count spoofing (`(memory_id, user_id)` UNIQUE). |
| `public.memory_comments` | `id UUID` (PK) | Threaded discussion comments on memories. |
| `public.gallery_albums` | `id UUID` (PK) | Media albums with JSONB photo arrays and cover URLs. |
| `public.site_settings` | `setting_key TEXT` (PK) | Global system configuration parameters with public/internal visibility separation (`is_public`). |
| `public.audit_logs` | `id UUID` (PK) | Immutable audit log written only by trusted database RPCs/triggers. |
| `public.member_projects` | `id UUID` (PK) | Showcase of pharmaceutical and tech research projects. |
| `public.internships` | `id UUID` (PK) | Verified student training and internship opportunities. |
| `public.cultural_resources` | `id UUID` (PK) | Scientific articles and leadership literature. |

---

## 3. Role & Permission Matrix

| Role | Scope & Permissions | Restricted Actions |
| :--- | :--- | :--- |
| **`OG`** | Global administrative authority over all committees, system settings, access code minting, audit logs, and global analytics. | Cannot bypass database relational integrity checks. |
| **`head`** | Full board member + Full administrative authority over **their own committee** (questions, tasks, applicants, members). | Cannot modify or view other committees' private tasks/questions. |
| **`sub_head`** | Full board member + Deputy administrative authority over **their own committee**. | Strictly isolated to their assigned committee. |
| **`ir_evaluator`** | Conducts assigned applicant interviews and submits monthly performance evaluations for assigned members. | Cannot evaluate unassigned members or modify committee settings. |
| **`member`** | Accesses own committee workspace, views assigned tasks, claims event certificates, posts memories. | Cannot modify applications, questions, or other members' data. |
| **`registered_user`**| Authenticated user; can register for events, claim personal certificates, and submit recruitment applications. | Cannot access internal committee workspaces or perform reviews. |
| **`guest`** | Public visitor; views public events, submits applications, registers with guest identity, verifies certificates. | No access to internal records or member data. |

---

## 4. Authoritative Database RPCs & Functions

### 1. `public.redeem_access_code(p_code TEXT)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Locks code row with `FOR UPDATE`, checks expiration, verifies `current_uses < max_uses`, verifies single redemption per user via `access_code_redemptions`, atomically updates `profiles` role and inserts/updates `committee_memberships`, logs action in `audit_logs`.

### 2. `public.submit_recruitment_application(p_applicant_name, p_phone, p_email, p_faculty_level, p_committee_id, p_dynamic_answers)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Enforces safe default states (`status = 'new'`, `ir_status = 'pending'`, `committee_decision = 'pending'`), snapshots current active questions for the committee + global questions into `question_snapshots`, prevents client override of review fields.

### 3. `public.assign_ir_member(p_evaluator_id UUID, p_member_id UUID)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Enforces maximum evaluator load (<= 30 active members), marks prior active assignments as `reassigned`, creates new `active` assignment record.

### 4. `public.assign_ir_applicant(p_evaluator_id UUID, p_application_id UUID)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Reassigns prior active evaluator, updates application status to `in_review`, creates new `active` applicant assignment.

### 5. `public.submit_monthly_evaluation(p_member_id, p_evaluation_month, p_score, p_criteria_scores, p_notes)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Enforces authorization (evaluator must be assigned to member, or committee Head/Sub-head, or OG), prevents self-evaluation, validates score ranges (0–100), prevents duplicate evaluation in the same month (`UNIQUE(member_id, evaluation_month)`).

### 6. `public.register_for_event(p_event_id UUID, p_name TEXT, p_phone TEXT, p_email TEXT)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Validates capacity, generates unique ticket code, prevents duplicate registration for authenticated users.

### 7. `public.mark_event_attendance(p_registration_id UUID, p_status TEXT)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Verifies caller is authorized leadership (`OG`, `head`, `sub_head`), stores caller's `auth.uid()` as `attendance_marked_by`, sets timestamp.

### 8. `public.issue_event_certificate(p_registration_id UUID)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Verifies event `certificate_enabled = true`, verifies `attendance_status = 'attended'`, pulls recipient name directly from registration/profile record, generates cryptographically unique verification code, issues exactly one certificate per registration.

### 9. `public.verify_certificate_public(p_code TEXT)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Returns ONLY non-sensitive verification fields (`valid`, `recipient_name`, `event_title`, `event_date`, `signatory_name`, `signatory_title`). No user IDs, emails, or phone numbers.

### 10. `public.toggle_memory_like(p_memory_id UUID)`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Inserts or deletes from `public.memory_likes` atomically and updates `memories.likes_count` based on true row count.

### 11. `public.get_public_profiles()`
- **Security**: `SECURITY DEFINER`
- **Integrity**: Exposes only public directory profile attributes (`id`, `full_name`, `username`, `role`, `avatar_url`, `bio`), protecting phone numbers, emails, and student IDs from public scrape.

---

## 5. Storage Buckets & Policies

1. **`avatars`** (Public Read, Authenticated Write with user ID prefix path `/avatars/{user_id}/*`).
2. **`gallery`** (Public Read, Board/OG Write).
3. **`certificates`** (Public Read for generated assets, Board/OG Write).
4. **`memories`** (Public Read, Authenticated Author Write).
