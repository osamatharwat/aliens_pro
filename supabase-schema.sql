-- ==============================================================================
-- ALIENS SPACE — CANONICAL DATABASE SCHEMA (REBUILT FROM SCRATCH)
-- ==============================================================================
-- Target Architecture: Supabase PostgreSQL 15+
-- Version: 4.0.0 (Clean-Slate Canonical Architecture)
-- Zero-Legacy Directive: Single public schema, normalized relational design,
-- zero legacy tables/views, zero client-side privilege escalation.
--
-- Roles:
--   - OG: Global Administrator
--   - head: Board Member + Head of ONE Committee
--   - sub_head: Board Member + Sub-Head of ONE Committee
--   - ir_evaluator: Internal Relations Evaluator
--   - member: Active Committee Member
--   - registered_user: Authenticated User (No committee membership)
--   - guest: Public Visitor
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. DOMAIN 1: IDENTITY & MEMBERSHIP
-- ==============================================================================

-- 2.1 PROFILES (Auth identity projection)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'registered_user',
  avatar_url TEXT NULL,
  phone TEXT NULL,
  student_id TEXT NULL,
  bio TEXT NULL,
  is_evaluator BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_profile_role CHECK (
    role IN ('OG', 'head', 'sub_head', 'ir_evaluator', 'member', 'registered_user', 'guest')
  )
);

-- 2.2 COMMITTEES (Relational committee entities)
CREATE TABLE IF NOT EXISTS public.committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Operational',
  description TEXT NOT NULL DEFAULT '',
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  icon TEXT NOT NULL DEFAULT 'Layers',
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 COMMITTEE MEMBERSHIPS (Relational source of truth for committee role/membership)
CREATE TABLE IF NOT EXISTS public.committee_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  membership_role TEXT NOT NULL DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_membership_role CHECK (
    membership_role IN ('head', 'sub_head', 'member', 'ir_evaluator')
  ),
  CONSTRAINT uq_user_committee UNIQUE (user_id, committee_id)
);

-- ==============================================================================
-- 3. DOMAIN 2: AUTHORIZATION & ACCESS CODES
-- ==============================================================================

-- 3.1 ACCESS CODES
CREATE TABLE IF NOT EXISTS public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'member',
  target_committee_id UUID NULL REFERENCES public.committees(id) ON DELETE SET NULL,
  target_membership_role TEXT NULL DEFAULT 'member',
  max_uses INT NOT NULL DEFAULT 1,
  current_uses INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ NULL,
  is_evaluator BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_code_target_role CHECK (
    target_role IN ('OG', 'head', 'sub_head', 'ir_evaluator', 'member', 'registered_user')
  ),
  CONSTRAINT chk_code_membership_role CHECK (
    target_membership_role IS NULL OR target_membership_role IN ('head', 'sub_head', 'member', 'ir_evaluator')
  )
);

-- 3.2 ACCESS CODE REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.access_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.access_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_code_user_redemption UNIQUE (code_id, user_id)
);

-- ==============================================================================
-- 4. DOMAIN 3: RECRUITMENT & DYNAMIC QUESTIONS
-- ==============================================================================

-- 4.1 DYNAMIC RECRUITMENT QUESTIONS (Global or committee scoped)
CREATE TABLE IF NOT EXISTS public.dynamic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  is_global BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_question_scope CHECK (
    (is_global = TRUE AND committee_id IS NULL) OR
    (is_global = FALSE AND committee_id IS NOT NULL)
  )
);

-- 4.2 RECRUITMENT APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NULL,
  faculty_level TEXT NOT NULL,
  committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE RESTRICT,
  dynamic_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_snapshots JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'accepted', 'rejected', 'shifted')),
  ir_status TEXT NOT NULL DEFAULT 'pending' CHECK (ir_status IN ('pending', 'accepted', 'rejected')),
  committee_decision TEXT NOT NULL DEFAULT 'pending' CHECK (committee_decision IN ('pending', 'accepted', 'rejected', 'shifted')),
  ir_notes TEXT NULL,
  committee_notes TEXT NULL,
  shift_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. DOMAIN 4: INTERNAL RELATIONS (IR) WORKFLOWS
-- ==============================================================================

-- 5.1 IR MEMBER ASSIGNMENTS (Authoritative active member monitoring, Max 30 load)
CREATE TABLE IF NOT EXISTS public.ir_member_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reassigned', 'completed')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL,
  CONSTRAINT chk_no_self_member_assignment CHECK (evaluator_id <> member_id)
);

-- 5.2 IR APPLICANT ASSIGNMENTS (Authoritative applicant interview routing)
CREATE TABLE IF NOT EXISTS public.ir_applicant_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  assigned_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reassigned', 'completed')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL
);

-- 5.3 PERFORMANCE EVALUATIONS (Monthly member evaluations)
CREATE TABLE IF NOT EXISTS public.performance_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evaluation_month TEXT NOT NULL, -- Format: YYYY-MM
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  criteria_scores JSONB NOT NULL DEFAULT '{"commitment":25,"communication":25,"task_quality":25,"initiative":25}'::jsonb,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_member_month UNIQUE (member_id, evaluation_month),
  CONSTRAINT chk_no_self_eval CHECK (member_id <> evaluator_id)
);

-- ==============================================================================
-- 6. DOMAIN 5: EVENTS, ATTENDANCE & CERTIFICATES
-- ==============================================================================

-- 6.1 EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL DEFAULT 'Online',
  image_url TEXT NULL,
  category TEXT NOT NULL DEFAULT 'workshop' CHECK (category IN ('technical', 'clinical', 'soft_skills', 'workshop', 'hackathon')),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  certificate_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  registration_open BOOLEAN NOT NULL DEFAULT TRUE,
  capacity INT NOT NULL DEFAULT 100,
  current_attendees_count INT NOT NULL DEFAULT 0,
  whatsapp_group_url TEXT NULL,
  action_link TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.2 EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  registrant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NULL,
  ticket_code TEXT UNIQUE NOT NULL,
  attendance_status TEXT NOT NULL DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'not_completed')),
  attendance_marked_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  attendance_marked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_auth_user UNIQUE (event_id, user_id)
);

-- 6.3 CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id UUID UNIQUE NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  verification_code TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  signatory_name TEXT NOT NULL,
  signatory_title TEXT NOT NULL,
  user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. DOMAIN 6: TASKS & COLLABORATION
-- ==============================================================================

-- 7.1 TASKS (Committee-scoped operational tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NULL,
  assigned_to UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  due_date TIMESTAMPTZ NULL,
  created_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7.2 MEMORIES (Community feed items)
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT NULL,
  memory_text TEXT NOT NULL,
  image_url TEXT NULL,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7.3 MEMORY LIKES (Relational unique user likes)
CREATE TABLE IF NOT EXISTS public.memory_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_memory_user_like UNIQUE (memory_id, user_id)
);

-- 7.4 MEMORY COMMENTS
CREATE TABLE IF NOT EXISTS public.memory_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7.5 GALLERY ALBUMS
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  photos_count INT NOT NULL DEFAULT 0,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. DOMAIN 7: ACADEMIC & CAREER MODULES
-- ==============================================================================

-- 8.1 MEMBER PROJECTS
CREATE TABLE IF NOT EXISTS public.member_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  committee_name TEXT NOT NULL,
  description TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  link_url TEXT NULL,
  image_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8.2 INTERNSHIPS
CREATE TABLE IF NOT EXISTS public.internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT NOT NULL,
  duration TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  apply_link TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8.3 CULTURAL & SCIENTIFIC RESOURCES
CREATE TABLE IF NOT EXISTS public.cultural_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Scientific Article', 'Soft Skills Guide', 'Clinical Pharmacology', 'Leadership')),
  author TEXT NOT NULL,
  read_time TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. DOMAIN 8: SITE SETTINGS & GOVERNANCE
-- ==============================================================================

-- 9.1 SITE SETTINGS (Separation of public vs internal settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9.2 AUDIT LOGS (Append-only governance trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  actor_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. INDEXES FOR RELATIONAL PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.committee_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_comm ON public.committee_memberships(committee_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_questions_comm ON public.dynamic_questions(committee_id);
CREATE INDEX IF NOT EXISTS idx_applications_comm ON public.applications(committee_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_ir_member_asgn_evaluator ON public.ir_member_assignments(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_ir_member_asgn_member ON public.ir_member_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_ir_member_asgn_active ON public.ir_member_assignments(evaluator_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ir_app_asgn_evaluator ON public.ir_applicant_assignments(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_ir_app_asgn_app ON public.ir_applicant_assignments(application_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_member ON public.performance_evaluations(member_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_month ON public.performance_evaluations(evaluation_month);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket ON public.event_registrations(ticket_code);
CREATE INDEX IF NOT EXISTS idx_certificates_reg ON public.certificates(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_tasks_comm ON public.tasks(committee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 11. SECURITY DEFINER HELPER FUNCTIONS
-- ==============================================================================

-- 11.1 SAFE AUTH HELPERS (Break RLS recursion)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_og()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'OG'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_committee_lead(p_committee_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.committee_memberships
    WHERE user_id = auth.uid()
      AND committee_id = p_committee_id
      AND membership_role IN ('head', 'sub_head')
      AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_ir_lead()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.committee_memberships cm
    JOIN public.committees c ON c.id = cm.committee_id
    WHERE cm.user_id = auth.uid()
      AND c.key = 'ir'
      AND cm.membership_role IN ('head', 'sub_head')
      AND cm.is_active = TRUE
  );
$$;

-- ==============================================================================
-- 12. TRIGGERS
-- ==============================================================================

-- 12.1 AUTOMATIC PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_full_name TEXT;
  v_username TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) THEN
    v_username := v_username || '_' || substr(NEW.id::text, 1, 4);
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    username,
    email,
    role,
    is_evaluator,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_full_name,
    v_username,
    NEW.email,
    'registered_user',
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12.2 PREVENT DIRECT CLIENT ROLE ESCALATION
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_role TEXT;
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();

  IF (v_caller_role IS NULL OR v_caller_role <> 'OG') THEN
    IF (OLD.role IS DISTINCT FROM NEW.role) OR
       (OLD.is_evaluator IS DISTINCT FROM NEW.is_evaluator) THEN
      RAISE EXCEPTION 'غير مصرح لك بتعديل الرتبة أو الصلاحيات مباشرة. يرجى استخدام كود الترقية المعتمد.';
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ==============================================================================
-- 13. CANONICAL DATABASE RPC CONTRACT
-- ==============================================================================

-- 13.1 REDEEM ACCESS CODE
CREATE OR REPLACE FUNCTION public.redeem_access_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_caller public.profiles%ROWTYPE;
  v_code public.access_codes%ROWTYPE;
  v_comm public.committees%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول لاستخدام كود الترقية.';
  END IF;

  SELECT * INTO v_caller FROM public.profiles WHERE id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الملف الشخصي للمستخدم غير موجود.';
  END IF;

  SELECT * INTO v_code
  FROM public.access_codes
  WHERE UPPER(code) = UPPER(TRIM(p_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'كود الترقية غير صحيح أو غير موجود.';
  END IF;

  IF v_code.is_active = FALSE THEN
    RAISE EXCEPTION 'تم إيقاف تفعيل هذا الكود.';
  END IF;

  IF v_code.current_uses >= v_code.max_uses THEN
    RAISE EXCEPTION 'تم استنفاذ الحد الأقصى لاستخدام هذا الكود.';
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < NOW() THEN
    RAISE EXCEPTION 'انتهت صلاحية هذا الكود.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.access_code_redemptions WHERE code_id = v_code.id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'لقد قمت باستخدام هذا الكود مسبقاً.';
  END IF;

  -- Record redemption
  INSERT INTO public.access_code_redemptions (code_id, user_id, redeemed_at)
  VALUES (v_code.id, v_user_id, NOW());

  -- Update code usage
  UPDATE public.access_codes
  SET current_uses = current_uses + 1,
      is_active = (current_uses + 1 < max_uses)
  WHERE id = v_code.id;

  -- Upgrade profile role
  UPDATE public.profiles
  SET role = v_code.target_role,
      is_evaluator = (v_code.target_role = 'ir_evaluator' OR v_code.is_evaluator = TRUE),
      updated_at = NOW()
  WHERE id = v_user_id;

  -- Relational membership creation if target committee specified
  IF v_code.target_committee_id IS NOT NULL THEN
    SELECT * INTO v_comm FROM public.committees WHERE id = v_code.target_committee_id;
    
    INSERT INTO public.committee_memberships (
      user_id,
      committee_id,
      membership_role,
      is_active,
      joined_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_code.target_committee_id,
      COALESCE(v_code.target_membership_role, 'member'),
      TRUE,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, committee_id) DO UPDATE SET
      membership_role = EXCLUDED.membership_role,
      is_active = TRUE,
      updated_at = NOW();
  END IF;

  -- Audit log
  INSERT INTO public.audit_logs (actor_name, actor_role, actor_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    v_caller.full_name,
    v_code.target_role,
    v_user_id,
    'REDEEM_CODE',
    'access_codes',
    v_code.id::text,
    'ترقية الحساب إلى رتبة ' || v_code.target_role || COALESCE(' في لجنة ' || v_comm.name_ar, ''),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'role', v_code.target_role,
    'committee_id', v_code.target_committee_id,
    'membership_role', v_code.target_membership_role,
    'is_evaluator', (v_code.target_role = 'ir_evaluator' OR v_code.is_evaluator = TRUE)
  );
END;
$$;

-- 13.2 SUBMIT RECRUITMENT APPLICATION
CREATE OR REPLACE FUNCTION public.submit_recruitment_application(
  p_applicant_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_faculty_level TEXT,
  p_committee_id UUID,
  p_dynamic_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_comm public.committees%ROWTYPE;
  v_snapshots JSONB;
  v_app_id UUID;
BEGIN
  -- Validate committee exists and is active
  SELECT * INTO v_comm FROM public.committees WHERE id = p_committee_id AND is_active = TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'اللجنة المحددة غير موجودة أو غير مفعلة للتقديم حالياً.';
  END IF;

  -- Snapshot active global + committee questions
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'question_text', question_text,
    'is_global', is_global,
    'order_index', order_index
  ) ORDER BY order_index ASC), '[]'::jsonb)
  INTO v_snapshots
  FROM public.dynamic_questions
  WHERE is_active = TRUE AND (is_global = TRUE OR committee_id = p_committee_id);

  INSERT INTO public.applications (
    applicant_name,
    phone,
    email,
    faculty_level,
    committee_id,
    dynamic_answers,
    question_snapshots,
    status,
    ir_status,
    committee_decision,
    created_at,
    updated_at
  ) VALUES (
    TRIM(p_applicant_name),
    TRIM(p_phone),
    NULLIF(TRIM(p_email), ''),
    TRIM(p_faculty_level),
    p_committee_id,
    COALESCE(p_dynamic_answers, '{}'::jsonb),
    v_snapshots,
    'new',
    'pending',
    'pending',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_app_id;

  RETURN jsonb_build_object('success', true, 'application_id', v_app_id);
END;
$$;

-- 13.3 ASSIGN IR MEMBER (ATOMIC ENFORCEMENT: 1 ACTIVE EVALUATOR & MAX 30 ACTIVE MEMBERS LOAD)
CREATE OR REPLACE FUNCTION public.assign_ir_member(
  p_evaluator_id UUID,
  p_member_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_load INT;
  v_new_asgn_id UUID;
BEGIN
  IF NOT (public.is_og() OR public.is_ir_lead()) THEN
    RAISE EXCEPTION 'غير مصرح: يحق فقط لقيادة لجنة العلاقات الداخلية أو إدارة الكيان توزيع الأعضاء.';
  END IF;

  IF p_evaluator_id = p_member_id THEN
    RAISE EXCEPTION 'لا يمكن للمقيّم متابعة نفسه.';
  END IF;

  -- Check evaluator load limit (Max 30 active members)
  SELECT COUNT(*) INTO v_current_load
  FROM public.ir_member_assignments
  WHERE evaluator_id = p_evaluator_id AND status = 'active';

  IF v_current_load >= 30 THEN
    RAISE EXCEPTION 'وصل المقيّم للحد الأقصى للقدرة الاستيعابية (30 عضواً نشطاً).';
  END IF;

  -- Close existing active assignment for this member
  UPDATE public.ir_member_assignments
  SET status = 'reassigned',
      completed_at = NOW()
  WHERE member_id = p_member_id AND status = 'active';

  -- Create new assignment
  INSERT INTO public.ir_member_assignments (evaluator_id, member_id, assigned_by, status, assigned_at)
  VALUES (p_evaluator_id, p_member_id, auth.uid(), 'active', NOW())
  RETURNING id INTO v_new_asgn_id;

  RETURN jsonb_build_object('success', true, 'assignment_id', v_new_asgn_id, 'current_load', v_current_load + 1);
END;
$$;

-- 13.4 ASSIGN IR APPLICANT (1 ACTIVE EVALUATOR PER APPLICANT)
CREATE OR REPLACE FUNCTION public.assign_ir_applicant(
  p_evaluator_id UUID,
  p_application_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_new_asgn_id UUID;
BEGIN
  IF NOT (public.is_og() OR public.is_ir_lead()) THEN
    RAISE EXCEPTION 'غير مصرح: يحق فقط لقيادة العلاقات الداخلية أو إدارة الكيان توزيع المقابلات.';
  END IF;

  -- Close existing active assignment for this application
  UPDATE public.ir_applicant_assignments
  SET status = 'reassigned',
      completed_at = NOW()
  WHERE application_id = p_application_id AND status = 'active';

  -- Update application status
  UPDATE public.applications
  SET status = 'in_review',
      updated_at = NOW()
  WHERE id = p_application_id;

  INSERT INTO public.ir_applicant_assignments (evaluator_id, application_id, assigned_by, status, assigned_at)
  VALUES (p_evaluator_id, p_application_id, auth.uid(), 'active', NOW())
  RETURNING id INTO v_new_asgn_id;

  RETURN jsonb_build_object('success', true, 'assignment_id', v_new_asgn_id);
END;
$$;

-- 13.5 SUBMIT MONTHLY EVALUATION
CREATE OR REPLACE FUNCTION public.submit_monthly_evaluation(
  p_member_id UUID,
  p_evaluation_month TEXT,
  p_score NUMERIC,
  p_criteria_scores JSONB,
  p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_is_assigned BOOLEAN;
  v_eval_id UUID;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول لتسجيل التقييم.';
  END IF;

  IF v_caller_id = p_member_id THEN
    RAISE EXCEPTION 'لا يمكنك تقييم نفسك.';
  END IF;

  -- Verify authorization: OG, IR leadership, or assigned evaluator
  SELECT EXISTS (
    SELECT 1 FROM public.ir_member_assignments 
    WHERE evaluator_id = v_caller_id AND member_id = p_member_id AND status = 'active'
  ) INTO v_is_assigned;

  IF NOT (public.is_og() OR public.is_ir_lead() OR v_is_assigned) THEN
    RAISE EXCEPTION 'غير مصرح: لست المقيّم المعين لهذا العضو أو مسؤول العلاقات الداخلية.';
  END IF;

  INSERT INTO public.performance_evaluations (
    member_id,
    evaluator_id,
    evaluation_month,
    score,
    criteria_scores,
    notes,
    created_at,
    updated_at
  ) VALUES (
    p_member_id,
    v_caller_id,
    p_evaluation_month,
    p_score,
    COALESCE(p_criteria_scores, '{"commitment":25,"communication":25,"task_quality":25,"initiative":25}'::jsonb),
    p_notes,
    NOW(),
    NOW()
  )
  ON CONFLICT (member_id, evaluation_month) DO UPDATE SET
    score = EXCLUDED.score,
    criteria_scores = EXCLUDED.criteria_scores,
    notes = EXCLUDED.notes,
    evaluator_id = EXCLUDED.evaluator_id,
    updated_at = NOW()
  RETURNING id INTO v_eval_id;

  RETURN jsonb_build_object('success', true, 'evaluation_id', v_eval_id);
END;
$$;

-- 13.6 REGISTER FOR EVENT
CREATE OR REPLACE FUNCTION public.register_for_event(
  p_event_id UUID,
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event public.events%ROWTYPE;
  v_user_id UUID;
  v_ticket_code TEXT;
  v_reg_id UUID;
  v_current_count INT;
BEGIN
  v_user_id := auth.uid();

  SELECT * INTO v_event FROM public.events WHERE id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الفعالية غير موجودة.';
  END IF;

  IF v_event.is_published = FALSE OR v_event.registration_open = FALSE THEN
    RAISE EXCEPTION 'التسجيل في هذه الفعالية مغلق حالياً.';
  END IF;

  -- Capacity check
  SELECT COUNT(*) INTO v_current_count FROM public.event_registrations WHERE event_id = p_event_id;
  IF v_current_count >= v_event.capacity THEN
    RAISE EXCEPTION 'اكتمل العدد المحدد لهذه الفعالية.';
  END IF;

  -- Check existing registration for authenticated user
  IF v_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.event_registrations WHERE event_id = p_event_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'أنت مسجل بالفعل في هذه الفعالية.';
  END IF;

  v_ticket_code := 'TCK-' || UPPER(SUBSTR(MD5(p_event_id::text || p_phone || NOW()::text), 1, 8));

  INSERT INTO public.event_registrations (
    event_id,
    user_id,
    registrant_name,
    phone,
    email,
    ticket_code,
    attendance_status,
    created_at
  ) VALUES (
    p_event_id,
    v_user_id,
    TRIM(p_name),
    TRIM(p_phone),
    NULLIF(TRIM(p_email), ''),
    v_ticket_code,
    'registered',
    NOW()
  )
  RETURNING id INTO v_reg_id;

  -- Update attendee counter
  UPDATE public.events
  SET current_attendees_count = current_attendees_count + 1
  WHERE id = p_event_id;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_reg_id,
    'ticket_code', v_ticket_code
  );
END;
$$;

-- 13.7 MARK EVENT ATTENDANCE
CREATE OR REPLACE FUNCTION public.mark_event_attendance(
  p_registration_id UUID,
  p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_auth_role();
  IF v_role NOT IN ('OG', 'head', 'sub_head') THEN
    RAISE EXCEPTION 'غير مصرح: يحق فقط لإدارة الفعاليات أو الهيئة الإدارية تسجيل الحضور.';
  END IF;

  IF p_status NOT IN ('attended', 'not_completed', 'registered') THEN
    RAISE EXCEPTION 'حالة الحضور غير صحيحة.';
  END IF;

  UPDATE public.event_registrations
  SET attendance_status = p_status,
      attendance_marked_by = auth.uid(),
      attendance_marked_at = NOW()
  WHERE id = p_registration_id;

  RETURN jsonb_build_object('success', true, 'status', p_status);
END;
$$;

-- 13.8 ISSUE EVENT CERTIFICATE
CREATE OR REPLACE FUNCTION public.issue_event_certificate(p_registration_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reg public.event_registrations%ROWTYPE;
  v_event public.events%ROWTYPE;
  v_cert_id UUID;
  v_code TEXT;
  v_sig_name TEXT;
  v_sig_title TEXT;
BEGIN
  SELECT * INTO v_reg FROM public.event_registrations WHERE id = p_registration_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'سجل التسجيل غير موجود.';
  END IF;

  SELECT * INTO v_event FROM public.events WHERE id = v_reg.event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الفعالية غير موجودة.';
  END IF;

  IF v_event.certificate_enabled = FALSE THEN
    RAISE EXCEPTION 'الشهادات غير مفعلة لهذه الفعالية.';
  END IF;

  IF v_reg.attendance_status <> 'attended' THEN
    RAISE EXCEPTION 'لم يتم تأكيد حضورك للفعالية. الشهادة تصدر فقط لمن حضر الفعالية.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.certificates WHERE registration_id = p_registration_id) THEN
    SELECT id, verification_code INTO v_cert_id, v_code FROM public.certificates WHERE registration_id = p_registration_id;
    RETURN jsonb_build_object('success', true, 'certificate_id', v_cert_id, 'verification_code', v_code, 'already_issued', true);
  END IF;

  SELECT COALESCE(setting_value, 'Aliens Space High Board') INTO v_sig_name FROM public.site_settings WHERE setting_key = 'certificate_signatory_name';
  SELECT COALESCE(setting_value, 'Academic & Lead Committee') INTO v_sig_title FROM public.site_settings WHERE setting_key = 'certificate_signatory_title';

  v_code := 'ALN-' || UPPER(SUBSTR(MD5(p_registration_id::text || NOW()::text), 1, 8));

  INSERT INTO public.certificates (
    event_id,
    registration_id,
    verification_code,
    recipient_name,
    event_title,
    event_date,
    signatory_name,
    signatory_title,
    user_id,
    issued_at
  ) VALUES (
    v_event.id,
    v_reg.id,
    v_code,
    v_reg.registrant_name,
    v_event.title,
    v_event.event_date,
    COALESCE(v_sig_name, 'Aliens Space High Board'),
    COALESCE(v_sig_title, 'Academic Lead'),
    v_reg.user_id,
    NOW()
  )
  RETURNING id INTO v_cert_id;

  RETURN jsonb_build_object(
    'success', true,
    'certificate_id', v_cert_id,
    'verification_code', v_code,
    'recipient_name', v_reg.registrant_name
  );
END;
$$;

-- 13.9 VERIFY CERTIFICATE PUBLIC (ZERO SENSITIVE PII EXPOSURE)
CREATE OR REPLACE FUNCTION public.verify_certificate_public(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_cert public.certificates%ROWTYPE;
BEGIN
  SELECT * INTO v_cert
  FROM public.certificates
  WHERE UPPER(verification_code) = UPPER(TRIM(p_code));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'رمز التحقق غير صحيح أو لم يتم إصدار شهادة مطابقة.');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'verification_code', v_cert.verification_code,
    'recipient_name', v_cert.recipient_name,
    'event_title', v_cert.event_title,
    'event_date', v_cert.event_date,
    'signatory_name', v_cert.signatory_name,
    'signatory_title', v_cert.signatory_title,
    'issued_at', v_cert.issued_at
  );
END;
$$;

-- 13.10 TOGGLE MEMORY LIKE
CREATE OR REPLACE FUNCTION public.toggle_memory_like(p_memory_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_liked BOOLEAN;
  v_count INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول للإعجاب.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.memory_likes WHERE memory_id = p_memory_id AND user_id = v_user_id) THEN
    DELETE FROM public.memory_likes WHERE memory_id = p_memory_id AND user_id = v_user_id;
    v_liked := false;
  ELSE
    INSERT INTO public.memory_likes (memory_id, user_id) VALUES (p_memory_id, v_user_id);
    v_liked := true;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.memory_likes WHERE memory_id = p_memory_id;

  UPDATE public.memories
  SET likes_count = v_count
  WHERE id = p_memory_id;

  RETURN jsonb_build_object('success', true, 'liked', v_liked, 'likes_count', v_count);
END;
$$;

-- 13.11 GET PUBLIC PROFILES (SAFE DIRECTORY QUERY)
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  username TEXT,
  role TEXT,
  avatar_url TEXT,
  bio TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id, full_name, username, role, avatar_url, bio
  FROM public.profiles
  ORDER BY full_name ASC;
$$;

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ir_member_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ir_applicant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_resources ENABLE ROW LEVEL SECURITY;

-- 14.1 PROFILES
CREATE POLICY "Public read directory profiles" ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "OG manage profiles" ON public.profiles 
  FOR ALL USING (public.is_og());

-- 14.2 COMMITTEES
CREATE POLICY "Public read active committees" ON public.committees 
  FOR SELECT USING (is_active = true OR public.is_og());

CREATE POLICY "OG manage committees" ON public.committees 
  FOR ALL USING (public.is_og());

CREATE POLICY "Heads manage own committee metadata" ON public.committees 
  FOR UPDATE USING (public.is_committee_lead(id));

-- 14.3 COMMITTEE MEMBERSHIPS
CREATE POLICY "Public read active memberships" ON public.committee_memberships 
  FOR SELECT USING (true);

CREATE POLICY "OG manage memberships" ON public.committee_memberships 
  FOR ALL USING (public.is_og());

CREATE POLICY "Heads manage own committee memberships" ON public.committee_memberships 
  FOR ALL USING (public.is_committee_lead(committee_id));

-- 14.4 ACCESS CODES
CREATE POLICY "OG manage access codes" ON public.access_codes 
  FOR ALL USING (public.is_og());

CREATE POLICY "Users view own redemptions" ON public.access_code_redemptions 
  FOR SELECT USING (auth.uid() = user_id OR public.is_og());

-- 14.5 DYNAMIC QUESTIONS
CREATE POLICY "Public read active questions" ON public.dynamic_questions 
  FOR SELECT USING (is_active = true OR public.is_og());

CREATE POLICY "OG manage questions" ON public.dynamic_questions 
  FOR ALL USING (public.is_og());

CREATE POLICY "Heads manage own committee questions" ON public.dynamic_questions 
  FOR ALL USING (public.is_committee_lead(committee_id));

-- 14.6 APPLICATIONS
CREATE POLICY "Public insert applications" ON public.applications 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "OG manage applications" ON public.applications 
  FOR ALL USING (public.is_og());

CREATE POLICY "Committee leadership review own applications" ON public.applications 
  FOR ALL USING (
    public.is_committee_lead(committee_id) OR public.is_ir_lead()
  );

CREATE POLICY "Assigned IR evaluators view assigned application" ON public.applications 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ir_applicant_assignments
      WHERE application_id = applications.id AND evaluator_id = auth.uid() AND status = 'active'
    )
  );

-- 14.7 IR ASSIGNMENTS & EVALUATIONS
CREATE POLICY "View IR member assignments" ON public.ir_member_assignments 
  FOR SELECT USING (
    auth.uid() = evaluator_id 
    OR auth.uid() = member_id 
    OR public.is_og() 
    OR public.is_ir_lead()
  );

CREATE POLICY "Manage IR member assignments" ON public.ir_member_assignments 
  FOR ALL USING (public.is_og() OR public.is_ir_lead());

CREATE POLICY "View IR applicant assignments" ON public.ir_applicant_assignments 
  FOR SELECT USING (
    auth.uid() = evaluator_id 
    OR public.is_og() 
    OR public.is_ir_lead()
  );

CREATE POLICY "Manage IR applicant assignments" ON public.ir_applicant_assignments 
  FOR ALL USING (public.is_og() OR public.is_ir_lead());

CREATE POLICY "View performance evaluations" ON public.performance_evaluations 
  FOR SELECT USING (
    auth.uid() = member_id 
    OR auth.uid() = evaluator_id 
    OR public.is_og() 
    OR public.is_ir_lead()
  );

CREATE POLICY "Manage performance evaluations" ON public.performance_evaluations 
  FOR ALL USING (
    auth.uid() = evaluator_id 
    OR public.is_og() 
    OR public.is_ir_lead()
  );

-- 14.8 EVENTS & REGISTRATIONS
CREATE POLICY "Public read published events" ON public.events 
  FOR SELECT USING (is_published = true OR public.is_og() OR public.get_auth_role() IN ('head', 'sub_head'));

CREATE POLICY "Board manage events" ON public.events 
  FOR ALL USING (public.is_og() OR public.get_auth_role() IN ('head', 'sub_head'));

CREATE POLICY "Public register events" ON public.event_registrations 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own registration" ON public.event_registrations 
  FOR SELECT USING (auth.uid() = user_id OR public.is_og() OR public.get_auth_role() IN ('head', 'sub_head'));

CREATE POLICY "Event managers mark attendance" ON public.event_registrations 
  FOR UPDATE USING (public.is_og() OR public.get_auth_role() IN ('head', 'sub_head'));

-- 14.9 CERTIFICATES
CREATE POLICY "Users read own certificates" ON public.certificates 
  FOR SELECT USING (auth.uid() = user_id OR public.is_og() OR public.get_auth_role() IN ('head', 'sub_head'));

CREATE POLICY "Board manage certificates" ON public.certificates 
  FOR ALL USING (public.is_og() OR public.get_auth_role() IN ('head', 'sub_head'));

-- 14.10 TASKS
CREATE POLICY "Committee members read tasks" ON public.tasks 
  FOR SELECT USING (
    public.is_og() 
    OR EXISTS (
      SELECT 1 FROM public.committee_memberships 
      WHERE user_id = auth.uid() AND committee_id = tasks.committee_id AND is_active = TRUE
    )
  );

CREATE POLICY "Heads manage committee tasks" ON public.tasks 
  FOR ALL USING (
    public.is_og() OR public.is_committee_lead(committee_id)
  );

-- 14.11 MEMORIES & FEED
CREATE POLICY "Public read memories" ON public.memories 
  FOR SELECT USING (true);

CREATE POLICY "Members post memories" ON public.memories 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors manage own memories" ON public.memories 
  FOR UPDATE USING (auth.uid() = user_id OR public.is_og());

CREATE POLICY "Public read memory likes" ON public.memory_likes 
  FOR SELECT USING (true);

CREATE POLICY "Members toggle memory likes" ON public.memory_likes 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read memory comments" ON public.memory_comments 
  FOR SELECT USING (true);

CREATE POLICY "Members post comments" ON public.memory_comments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 14.12 GALLERY, SETTINGS & AUDIT LOGS
CREATE POLICY "Public read gallery" ON public.gallery_albums 
  FOR SELECT USING (true);

CREATE POLICY "Board manage gallery" ON public.gallery_albums 
  FOR ALL USING (public.is_og() OR public.get_auth_role() IN ('head', 'sub_head'));

CREATE POLICY "Public read public site settings" ON public.site_settings 
  FOR SELECT USING (is_public = TRUE OR public.is_og());

CREATE POLICY "OG manage site settings" ON public.site_settings 
  FOR ALL USING (public.is_og());

CREATE POLICY "Board read audit logs" ON public.audit_logs 
  FOR SELECT USING (public.is_og() OR public.get_auth_role() IN ('head', 'sub_head'));

CREATE POLICY "Allow system insert audit logs" ON public.audit_logs 
  FOR INSERT WITH CHECK (true);

-- 14.13 ACADEMIC & CAREER MODULES
CREATE POLICY "Public read member projects" ON public.member_projects 
  FOR SELECT USING (true);

CREATE POLICY "Public read internships" ON public.internships 
  FOR SELECT USING (is_active = TRUE OR public.is_og());

CREATE POLICY "Public read cultural resources" ON public.cultural_resources 
  FOR SELECT USING (true);

-- ==============================================================================
-- 15. CANONICAL INITIAL SEED (CANONICAL COMMITTEES, QUESTIONS & SITE SETTINGS)
-- ==============================================================================

-- 15.1 9 CANONICAL COMMITTEES
INSERT INTO public.committees (key, name, name_ar, category, description, icon, order_index, is_active)
VALUES
  ('marketing', 'Marketing Committee', 'لجنة التسويق', 'Operational', 'مسؤولة عن وضع الخطط التسويقية وحملات الترويج والوصول للجمهور المستهدف.', 'Target', 1, true),
  ('pr', 'Public Relations (PR)', 'لجنة العلاقات العامة', 'Academics & PR', 'بناء وإدارة الشراكات الأكاديمية والمؤسسية مع المستشفيات والشركات والجامعات.', 'Users', 2, true),
  ('media', 'Media & Content', 'لجنة الميديا وصناعة المحتوى', 'Tech & Media', 'إنتاج التصاميم والمونتاج والتغطيات الإعلامية وصناعة المحتوى العلمي والتوعوي.', 'Camera', 3, true),
  ('ir', 'Internal Relations (IR)', 'لجنة العلاقات الداخلية والمتابعة', 'Operational', 'متابعة وتقييم أداء أعضاء الكيان وتطوير الكفاءات وحل التحديات الداخلية.', 'Award', 4, true),
  ('event_planning', 'Event Planning & Operations', 'لجنة تنظيم الفعاليات', 'Operational', 'التخطيط اللوجستي والتنفيذي للمؤتمرات، ورش العمل، والمسابقات الصيدلانية.', 'Calendar', 5, true),
  ('secretary', 'Secretary & Documentation', 'لجنة السكرتارية والتوثيق', 'Operational', 'إدارة وتوثيق الاجتماعات، جداول المواعيد، الأرشيف الإداري، وسجلات الحضور.', 'FileText', 6, true),
  ('charity', 'Charity & Community Health', 'لجنة العمل الخيري والتوعية المجتمعية', 'Community & Charity', 'تنظيم القوافل الطبية وحملات التوعية الصحية وجمع التبرعات للأسر الأكثر احتياجاً.', 'Heart', 7, true),
  ('magic_hand', 'Magic Hand (Decor & Art)', 'لجنة الديكور واللمسات الإبداعية', 'Tech & Media', 'تصميم وتنسيق قاعات الفعاليات والمؤتمرات وإبراز الهوية البصرية للكيان.', 'Palette', 8, true),
  ('data_analysis', 'Data Analysis & Strategic Planning', 'لجنة تحليل البيانات والتخطيط الاستراتيجي', 'Academics & PR', 'تحليل استطلاعات الرأي وأداء الفعاليات ونمو الكيان وتقديم تقارير قيادية لاتخاذ القرار.', 'TrendingUp', 9, true)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;

-- 15.2 BASELINE PUBLIC SITE SETTINGS
INSERT INTO public.site_settings (setting_key, setting_value, is_public, description)
VALUES
  ('certificate_signatory_name', 'Aliens Space High Board', true, 'اسم الموقّع المعتمد على الشهادات الصادرة'),
  ('certificate_signatory_title', 'Academic & Lead Committee', true, 'الصفة الاعتبارية للموقّع على الشهادات'),
  ('recruitment_open', 'true', true, 'حالة فتح أو إغلاق باب التقديم والانضمام للكيان'),
  ('contact_pr_phone', '+20 100 123 4567', true, 'رقم التواصل الرسمي للعلاقات العامة'),
  ('contact_email', 'contact@aliens-space.org', true, 'البريد الإلكتروني الرسمي للتواصل'),
  ('hero_tagline', 'الكيان الأكاديمي والمهني الرائد لطلاب وخريجي كليات الصيدلة', true, 'العنوان الرئيسي الترويجي على الصفحة الرئيسية'),
  ('about_statement', 'كيان طلابي وأكاديمي متكامل يسعى لتمكين وتطوير طلاب الصيدلة من خلال ورش العمل، المؤتمرات، الأبحاث العلمية، والأنشطة القيادية والمجتمعية.', true, 'البيان التعريفي للكيان'),
  ('academic_lead_name', 'د. كريم عبد العزيز', true, 'اسم المشرف الأكاديمي')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  is_public = EXCLUDED.is_public,
  description = EXCLUDED.description;

-- 15.3 INITIAL RECRUITMENT DYNAMIC QUESTIONS (GLOBAL & COMMITTEE SPECIFIC)
INSERT INTO public.dynamic_questions (committee_id, question_text, is_global, order_index, is_active)
VALUES
  (NULL, 'لماذا ترغب في الانضمام إلى أسرة Aliens Space تحديداً؟ وما هي قيمتك المضافة؟', true, 1, true),
  (NULL, 'اذكر موقفاً واجهت فيه ضغط عمل أو اختلافاً في الرأي مع فريق، وكيف تعاملت معه؟', true, 2, true)
ON CONFLICT DO NOTHING;

-- Insert committee-specific baseline questions using committee subqueries
INSERT INTO public.dynamic_questions (committee_id, question_text, is_global, order_index, is_active)
SELECT id, 'ما هي استراتيجيتك لجذب 500 طالب صيدلة للتسجيل في مؤتمر علمي خلال 7 أيام؟', false, 3, true
FROM public.committees WHERE key = 'marketing'
ON CONFLICT DO NOTHING;

INSERT INTO public.dynamic_questions (committee_id, question_text, is_global, order_index, is_active)
SELECT id, 'ما هي البرامج والأدوات التي تجيد استخدامها (Photoshop, Premiere, Figma, إلخ) ورابط معرض أعمالك إن وجد؟', false, 3, true
FROM public.committees WHERE key = 'media'
ON CONFLICT DO NOTHING;

INSERT INTO public.dynamic_questions (committee_id, question_text, is_global, order_index, is_active)
SELECT id, 'كيف تبني شراكة رسمية مع إدارة تدريب إحدى كبرى شركات الأدوية لرعاية فعالية أكاديمية؟', false, 3, true
FROM public.committees WHERE key = 'pr'
ON CONFLICT DO NOTHING;

INSERT INTO public.dynamic_questions (committee_id, question_text, is_global, order_index, is_active)
SELECT id, 'كيف تقيّم وتتعامل مع عضو متميز تقنياً ولكن التزامه بمواعيد التسليم ضعيف؟', false, 3, true
FROM public.committees WHERE key = 'ir'
ON CONFLICT DO NOTHING;

INSERT INTO public.dynamic_questions (committee_id, question_text, is_global, order_index, is_active)
SELECT id, 'كيف تستفيد من استبيان حضور فعالية لتحسين الفعالية القادمة ورفع نسبة الرضا؟', false, 3, true
FROM public.committees WHERE key = 'data_analysis'
ON CONFLICT DO NOTHING;
