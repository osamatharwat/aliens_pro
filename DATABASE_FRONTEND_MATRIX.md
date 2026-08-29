# ALIENS SPACE — DATABASE TO FRONTEND SERVICE MATRIX
**Version:** 3.0.0 (Canonical Production Alignment)

| Service | Operation | PostgreSQL Table / RPC | Required Role / Authority | RLS / Server Validation Enforcement | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`authService`** | User Sign Up | `auth.users` + Trigger `handle_new_user` | Public / Guest | Auto-creates `public.profiles` with `role = 'registered_user'`. | Authenticated session with profile |
| **`authService`** | Get Profile | `public.profiles` | Authenticated / Public | RLS restricts private contact details to profile owner & authorized leadership. | User profile record |
| **`membershipService`** | Redeem Code | `RPC: public.redeem_access_code` | `registered_user`+ | `FOR UPDATE` lock, checks expiration, max uses, prevents duplicate redemption, atomically upgrades role & committee. | Upgraded Profile (`head`, `sub_head`, `member`, etc.) |
| **`membershipService`** | Create Code | `public.access_codes` | `OG` | RLS policy `OG manage all access codes`. | Minted access code object |
| **`committeeService`** | Get Committees | `public.committees` | Public | Select active committees ordered by order index. | List of 9 canonical committees |
| **`committeeService`** | Update Committee | `public.committees` | `OG` or `head`/`sub_head` of that committee | RLS: `OG manage all` OR `head manage own committee`. | Updated committee metadata |
| **`questionService`** | Get Questions | `public.dynamic_questions` | Public | Active questions where `committee_key = key OR global`. | List of dynamic questions |
| **`questionService`** | Manage Questions | `public.dynamic_questions` | `OG` or Committee `head`/`sub_head` | RLS: Head/Sub-Head can only manage their own committee questions. | Dynamic question CRUD |
| **`applicationService`**| Submit App | `RPC: public.submit_recruitment_application` | Public / Guest | Enforces initial status `new`, snapshots active questions, saves dynamic answers. | Created Application ID |
| **`applicationService`**| Review App | `public.applications` | `OG`, IR Evaluator, or Committee `head`/`sub_head` | RLS: Committee leadership sees only their committee; assigned IR sees assigned. | Updated application state & notes |
| **`irService`** | Assign Member | `RPC: public.assign_ir_member` | `OG` or `head`/`sub_head` of IR | Checks evaluator active load <= 30, closes old active assignments, creates new active assignment. | Active `ir_assignments` record |
| **`irService`** | Assign Applicant | `public.applications` or `ir_applicant_assignments` | `OG` or `head`/`sub_head` of IR | Updates `ir_assignee_id` and sets status `in_review`. | Assigned candidate for interview |
| **`evaluationService`** | Submit Monthly Eval | `RPC: public.submit_monthly_evaluation` | Assigned `ir_evaluator`, Committee `head`/`sub_head`, `OG` | Prevents self-evaluation, validates 0–100 scores, enforces unique `(member_id, month)`. | Created `performance_evaluations` record |
| **`eventService`** | Get Events | `public.events` | Public | Public read where `is_published = true`. | Published event catalogue |
| **`attendanceService`** | Register Event | `public.event_registrations` | Public / Registered User | Generates ticket code, checks capacity, sets status `registered`. | Ticket registration record |
| **`attendanceService`** | Mark Attendance | `RPC: public.mark_event_attendance` | `OG`, `head`, `sub_head`, `event_planning` | Enforces authorized leadership; stores marker ID & timestamp. | Status set to `attended` or `not_completed` |
| **`certificateService`**| Issue Certificate | `RPC: public.issue_event_certificate` | Authorized Board / System | Verifies `attendance_status = 'attended'` & `certificate_enabled = true`. Generates unique code. | Issued certificate record |
| **`certificateService`**| Public Verification | `RPC: public.verify_certificate_public` | Public | Returns ONLY safe fields (recipient name, event title, date, signatory). Zero PII leakage. | Verification payload |
| **`taskService`** | Manage Tasks | `public.tasks` | `OG` or Committee `head`/`sub_head` | RLS: Head/Sub-Head can only manage tasks within their `committee_key`. | Task CRUD |
| **`memoryService`** | Post Memory | `public.memories` | Authenticated `member`+ | Insert with author ID; RLS prevents modifying others' memories. | New memory item |
| **`memoryService`** | Toggle Like | `RPC: public.toggle_memory_like` | Authenticated | Atomic toggle in `memory_likes` table, increments/decrements counter. | Updated like state |
| **`galleryService`** | Get Albums | `public.gallery_albums` | Public | Public read; OG/Board write. | Media album catalogue |
| **`auditService`** | Log & View Audit | `public.audit_logs` | `OG`, `head`, `sub_head` | RLS: Board read. Inserts originate from trusted triggers/RPCs with `auth.uid()`. | Audit log entries |
