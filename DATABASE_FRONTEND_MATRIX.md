# ALIENS SPACE — DATABASE TO FRONTEND SERVICE MATRIX
**Version:** 4.0.0 (Clean-Slate Canonical Architecture)

| Service | Operation | PostgreSQL Table / RPC | Required Role / Authority | RLS / Server Validation Enforcement | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`authService`** | User Sign Up | `auth.users` + Trigger `handle_new_user` | Public / Guest | Auto-creates `public.profiles` with `role = 'registered_user'`. | Authenticated session with profile |
| **`authService`** | Get Current Profile | `public.profiles` | Authenticated | RLS: Users read directory profiles; own updates only. | User profile record |
| **`profileService`** | Get Public Profiles | `RPC: public.get_public_profiles` | Public | Returns safe directory projection (id, full_name, username, role, avatar_url, bio). | Public profiles array |
| **`profileService`** | Update Profile | `public.profiles` | Authenticated | Trigger `protect_profile_role` blocks direct privilege escalation. | Updated profile record |
| **`membershipService`** | Redeem Code | `RPC: public.redeem_access_code` | `registered_user`+ | `FOR UPDATE` lock, checks expiration, max uses, prevents duplicate redemption, atomically upgrades role & inserts `committee_memberships`. | Upgraded Profile & Membership |
| **`membershipService`** | Create Code | `public.access_codes` | `OG` | RLS policy `OG manage all access codes`. | Minted access code object |
| **`committeeService`** | Get Committees | `public.committees` | Public | Select active committees ordered by `order_index`. | List of canonical committees |
| **`committeeService`** | Get Memberships | `public.committee_memberships` | Public / Authenticated | Relational join with `profiles` to list members and leadership. | Memberships list |
| **`committeeService`** | Update Committee | `public.committees` | `OG` or `head`/`sub_head` of that committee | RLS: `is_og()` OR `is_committee_lead(id)`. | Updated committee record |
| **`questionService`** | Get Questions | `public.dynamic_questions` | Public | Active questions where `is_global = TRUE OR committee_id = id`. | Dynamic questions array |
| **`questionService`** | Manage Questions | `public.dynamic_questions` | `OG` or Committee `head`/`sub_head` | RLS: `is_og()` OR `is_committee_lead(committee_id)`. | Dynamic question CRUD |
| **`applicationService`**| Submit App | `RPC: public.submit_recruitment_application` | Public / Guest | Enforces initial status `new`, snapshots active questions, saves dynamic answers. | Created Application ID |
| **`applicationService`**| Review App | `public.applications` | `OG`, IR Evaluator, or Committee `head`/`sub_head` | RLS: Committee leadership sees own committee; assigned IR sees assigned. | Updated application state & notes |
| **`irService`** | Assign Member | `RPC: public.assign_ir_member` | `OG` or `head`/`sub_head` of IR | Checks evaluator active load <= 30, closes old active assignments, creates new active assignment. | Active `ir_member_assignments` record |
| **`irService`** | Assign Applicant | `RPC: public.assign_ir_applicant` | `OG` or `head`/`sub_head` of IR | Closes old assignment, updates application to `in_review`, creates new `ir_applicant_assignments`. | Active `ir_applicant_assignments` record |
| **`evaluationService`** | Submit Monthly Eval | `RPC: public.submit_monthly_evaluation` | Assigned `ir_evaluator`, IR Leadership, `OG` | Prevents self-evaluation, validates 0–100 scores, enforces unique `(member_id, evaluation_month)`. | Created `performance_evaluations` record |
| **`eventService`** | Get Events | `public.events` | Public | Public read where `is_published = true`. | Published event catalogue |
| **`attendanceService`** | Register Event | `RPC: public.register_for_event` | Public / Registered User | Generates ticket code, checks capacity, sets status `registered`. | Ticket registration record |
| **`attendanceService`** | Mark Attendance | `RPC: public.mark_event_attendance` | `OG`, `head`, `sub_head` | Enforces authorized leadership; stores marker ID & timestamp. | Status set to `attended` or `not_completed` |
| **`certificateService`**| Issue Certificate | `RPC: public.issue_event_certificate` | Authorized Board / System | Verifies `attendance_status = 'attended'` & `certificate_enabled = true`. Generates unique code. | Issued certificate record |
| **`certificateService`**| Public Verification | `RPC: public.verify_certificate_public` | Public | Returns ONLY safe fields (recipient name, event title, date, signatory). Zero PII leakage. | Verification payload |
| **`taskService`** | Manage Tasks | `public.tasks` | `OG` or Committee `head`/`sub_head` | RLS: Head/Sub-Head can only manage tasks within their `committee_id`. | Task CRUD |
| **`memoryService`** | Post Memory | `public.memories` | Authenticated `member`+ | Insert with author ID (`user_id = auth.uid()`); RLS prevents modifying others' memories. | New memory item |
| **`memoryService`** | Toggle Like | `RPC: public.toggle_memory_like` | Authenticated | Atomic toggle in `memory_likes` table, increments/decrements counter. | Updated like state |
| **`galleryService`** | Get Albums | `public.gallery_albums` | Public | Public read; OG/Board write. | Media album catalogue |
| **`settingsService`** | Get/Set Settings | `public.site_settings` | Public (for `is_public = true`), OG (manage all) | RLS: `is_public = true` for public read, `is_og()` for manage. | Site settings dictionary |
| **`auditService`** | Read Audit Logs | `public.audit_logs` | `OG`, `head`, `sub_head` | RLS: Board read. Inserts originate from trusted triggers/RPCs with `auth.uid()`. | Audit log entries |
