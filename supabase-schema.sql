-- ==============================================================================
-- ALIENS SPACE — CANONICAL PRODUCTION DATABASE SCHEMA (ZERO LEGACY / ZERO MOCK)
-- ==============================================================================
-- Clean, single-schema PostgreSQL definition for Supabase.
-- Role Model:
--   - OG: The sole Global Admin role.
--   - head: Board Member + Head of their specific committee.
--   - sub_head: Board Member + Sub-Head of their specific committee.
--   - ir_evaluator: Evaluator member within IR or designated across team.
--   - member: General active committee member.
--   - registered_user: Authenticated public user (unassigned).
--   - guest: Public visitor.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CORE TABLES
-- ==============================================================================

-- 2.1 PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'registered_user',
  committee_key TEXT NULL,
  committee_position TEXT NULL,
  avatar_url TEXT NULL,
  phone TEXT NULL,
  student_id TEXT NULL,
  assigned_ir UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_evaluator BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_profile_role CHECK (
    role IN ('OG', 'head', 'sub_head', 'ir_evaluator', 'member', 'registered_user', 'guest')
  ),
  CONSTRAINT chk_profile_position CHECK (
    committee_position IS NULL OR committee_position IN ('Head', 'Sub Head', 'Member')
  )
);

-- 2.2 COMMITTEES
CREATE TABLE IF NOT EXISTS public.committees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Operational',
  description TEXT NOT NULL DEFAULT '',
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  head_name TEXT NOT NULL DEFAULT 'قائد اللجنة',
  sub_head_name TEXT NOT NULL DEFAULT 'نائب القائد',
  active_members_count INT NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT 'Layers',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 ACCESS CODES & REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'member',
  committee_key TEXT NOT NULL DEFAULT 'none',
  committee_position TEXT NOT NULL DEFAULT 'Member',
  max_uses INT NOT NULL DEFAULT 1,
  current_uses INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ NULL,
  is_evaluator BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_code_role CHECK (
    target_role IN ('OG', 'head', 'sub_head', 'ir_evaluator', 'member', 'registered_user')
  )
);

CREATE TABLE IF NOT EXISTS public.access_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.access_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_code_user UNIQUE (code_id, user_id)
);

-- 2.4 DYNAMIC RECRUITMENT QUESTIONS
CREATE TABLE IF NOT EXISTS public.dynamic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 RECRUITMENT APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NULL,
  faculty_level TEXT NOT NULL,
  committee_key TEXT NOT NULL,
  committee_name TEXT NOT NULL,
  dynamic_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_snapshots JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'accepted', 'rejected', 'shifted')),
  ir_status TEXT NOT NULL DEFAULT 'pending' CHECK (ir_status IN ('pending', 'accepted', 'rejected')),
  ir_assignee_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  ir_notes TEXT NULL,
  committee_decision TEXT NOT NULL DEFAULT 'pending' CHECK (committee_decision IN ('pending', 'accepted', 'rejected', 'shifted')),
  committee_notes TEXT NULL,
  shift_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 IR EVALUATION ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.ir_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reassigned', 'completed')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 PERFORMANCE EVALUATIONS
CREATE TABLE IF NOT EXISTS public.performance_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evaluation_month TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  criteria_scores JSONB NOT NULL DEFAULT '{"commitment":25,"communication":25,"task_quality":25,"initiative":25}'::jsonb,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_member_month UNIQUE (member_id, evaluation_month)
);

-- 2.8 EVENTS, REGISTRATIONS & CERTIFICATES
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- 2.9 COMMITTEE TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NULL,
  assigned_to UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  due_date TIMESTAMPTZ NULL,
  created_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 MEMORIES & COMMENTS
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NULL,
  memory_text TEXT NOT NULL,
  image_url TEXT NULL,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.memory_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.11 GALLERY, SITE SETTINGS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  photos_count INT NOT NULL DEFAULT 0,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- 2.12 ACADEMIC & CAREER MODULES
CREATE TABLE IF NOT EXISTS public.member_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  committee TEXT NOT NULL,
  description TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  link_url TEXT NULL,
  image_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_committee ON public.profiles(committee_key);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_ir ON public.profiles(assigned_ir);
CREATE INDEX IF NOT EXISTS idx_applications_committee ON public.applications(committee_key);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_ir_assignee ON public.applications(ir_assignee_id);
CREATE INDEX IF NOT EXISTS idx_ir_assignments_evaluator ON public.ir_assignments(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_ir_assignments_member ON public.ir_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_member ON public.performance_evaluations(member_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_month ON public.performance_evaluations(evaluation_month);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket ON public.event_registrations(ticket_code);
CREATE INDEX IF NOT EXISTS idx_certificates_reg ON public.certificates(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_tasks_committee ON public.tasks(committee_key);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 4. FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 4.1 AUTOMATIC PROFILE CREATION ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_username TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

  -- Ensure unique username
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

-- 4.2 PREVENT CLIENT-SIDE ROLE ESCALATION
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Allow service_role or trigger context
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();

  -- If non-OG caller attempts to modify privilege fields directly
  IF (caller_role IS NULL OR caller_role <> 'OG') THEN
    IF (OLD.role IS DISTINCT FROM NEW.role) OR
       (OLD.committee_key IS DISTINCT FROM NEW.committee_key) OR
       (OLD.committee_position IS DISTINCT FROM NEW.committee_position) OR
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

-- 4.3 SECURE ATOMIC ACCESS CODE REDEMPTION (RPC)
CREATE OR REPLACE FUNCTION public.redeem_access_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_caller public.profiles%ROWTYPE;
  v_code public.access_codes%ROWTYPE;
  v_is_evaluator BOOLEAN;
  v_target_committee TEXT;
  v_target_position TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول لاستخدام كود الترقية.';
  END IF;

  SELECT * INTO v_caller FROM public.profiles WHERE id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الملف الشخصي للمستخدم غير موجود.';
  END IF;

  -- Lock and find code
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

  -- Increment usage counter
  UPDATE public.access_codes
  SET current_uses = current_uses + 1,
      is_active = (current_uses + 1 < max_uses)
  WHERE id = v_code.id;

  v_target_committee := NULLIF(v_code.committee_key, 'none');
  v_target_position := COALESCE(v_code.committee_position, 'Member');
  v_is_evaluator := (v_code.target_role = 'ir_evaluator' OR v_target_committee = 'ir' OR v_code.is_evaluator = TRUE);

  -- Upgrade profile
  UPDATE public.profiles
  SET role = v_code.target_role,
      committee_key = v_target_committee,
      committee_position = v_target_position,
      is_evaluator = v_is_evaluator,
      updated_at = NOW()
  WHERE id = v_user_id;

  -- Audit log
  INSERT INTO public.audit_logs (actor_name, actor_role, actor_id, action, entity_type, entity_id, details, created_at)
  VALUES (
    v_caller.full_name,
    v_code.target_role,
    v_user_id,
    'REDEEM_CODE',
    'access_codes',
    v_code.id::text,
    'ترقية الحساب إلى رتبة ' || v_code.target_role || ' في لجنة ' || COALESCE(v_target_committee, 'عام'),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'role', v_code.target_role,
    'committee_key', v_target_committee,
    'committee_position', v_target_position,
    'is_evaluator', v_is_evaluator
  );
END;
$$;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ir_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_resources ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "OG manage profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OG')
);

-- 5.2 COMMITTEES
CREATE POLICY "Public read committees" ON public.committees FOR SELECT USING (is_active = true);
CREATE POLICY "OG manage all committees" ON public.committees FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OG')
);
CREATE POLICY "Heads manage own committee" ON public.committees FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND p.role IN ('head', 'sub_head') 
      AND p.committee_key = committees.key
  )
);

-- 5.3 ACCESS CODES
CREATE POLICY "OG manage all access codes" ON public.access_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OG')
);
CREATE POLICY "Heads view own committee access codes" ON public.access_codes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND p.role IN ('head', 'sub_head') 
      AND p.committee_key = access_codes.committee_key
  )
);
CREATE POLICY "Users view own redemptions" ON public.access_code_redemptions FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OG')
);

-- 5.4 DYNAMIC QUESTIONS
CREATE POLICY "Public read dynamic questions" ON public.dynamic_questions FOR SELECT USING (is_active = true);
CREATE POLICY "OG manage all dynamic questions" ON public.dynamic_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OG')
);
CREATE POLICY "Heads manage own committee dynamic questions" ON public.dynamic_questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND p.role IN ('head', 'sub_head') 
      AND (p.committee_key = dynamic_questions.committee_key OR dynamic_questions.committee_key = 'global')
  )
);

-- 5.5 APPLICATIONS
CREATE POLICY "Public submit application" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "OG read all applications" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OG')
);
CREATE POLICY "OG update all applications" ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OG')
);
CREATE POLICY "Heads read and update own committee applications" ON public.applications FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        (p.role IN ('head', 'sub_head') AND (p.committee_key = applications.committee_key OR p.committee_key = 'ir'))
        OR (p.is_evaluator = true AND applications.ir_assignee_id = p.id)
      )
  )
);

-- 5.6 IR ASSIGNMENTS & EVALUATIONS
CREATE POLICY "View IR assignments" ON public.ir_assignments FOR SELECT USING (
  auth.uid() = evaluator_id OR auth.uid() = member_id OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND (p.role = 'OG' OR (p.role IN ('head', 'sub_head') AND p.committee_key = 'ir'))
  )
);
CREATE POLICY "Manage IR assignments" ON public.ir_assignments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND (p.role = 'OG' OR (p.role IN ('head', 'sub_head') AND p.committee_key = 'ir'))
  )
);

CREATE POLICY "View performance evaluations" ON public.performance_evaluations FOR SELECT USING (
  auth.uid() = member_id OR auth.uid() = evaluator_id OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND (
        p.role = 'OG' 
        OR (p.role IN ('head', 'sub_head') AND (p.committee_key = 'ir' OR p.committee_key = (SELECT committee_key FROM public.profiles WHERE id = performance_evaluations.member_id)))
      )
  )
);
CREATE POLICY "Evaluators manage performance evaluations" ON public.performance_evaluations FOR ALL USING (
  auth.uid() = evaluator_id OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND (p.role = 'OG' OR (p.role IN ('head', 'sub_head') AND p.committee_key = 'ir'))
  )
);

-- 5.7 EVENTS, REGISTRATIONS & CERTIFICATES
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Board manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OG', 'head', 'sub_head'))
);

CREATE POLICY "Public register events" ON public.event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own ticket" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Active members manage registrations" ON public.event_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OG', 'head', 'sub_head', 'member', 'ir_evaluator'))
);

CREATE POLICY "Public verify certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Board manage certificates" ON public.certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OG', 'head', 'sub_head'))
);

-- 5.8 TASKS
CREATE POLICY "Committee members read tasks" ON public.tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND (p.role = 'OG' OR p.committee_key = tasks.committee_key)
  )
);
CREATE POLICY "Heads manage own committee tasks" ON public.tasks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND (p.role = 'OG' OR (p.role IN ('head', 'sub_head') AND p.committee_key = tasks.committee_key))
  )
);

-- 5.9 MEMORIES & SOCIAL FEED
CREATE POLICY "Public read memories" ON public.memories FOR SELECT USING (true);
CREATE POLICY "Members post memories" ON public.memories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Public like memories" ON public.memories FOR UPDATE USING (true);
CREATE POLICY "Public read memory comments" ON public.memory_comments FOR SELECT USING (true);
CREATE POLICY "Members post memory comments" ON public.memory_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5.10 SITE SETTINGS & AUDIT LOGS
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "OG manage settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OG')
);

CREATE POLICY "Board view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OG', 'head', 'sub_head'))
);
CREATE POLICY "Allow system insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 5.11 PORTFOLIO & ACADEMICS
CREATE POLICY "Public read projects" ON public.member_projects FOR SELECT USING (true);
CREATE POLICY "Public read internships" ON public.internships FOR SELECT USING (is_active = true);
CREATE POLICY "Public read resources" ON public.cultural_resources FOR SELECT USING (true);

-- ==============================================================================
-- 6. CANONICAL INITIAL SEED (ORGANIZATIONAL METADATA ONLY — NO FAKE USERS)
-- ==============================================================================

-- 9 Canonical Committees
INSERT INTO public.committees (key, name, name_ar, category, description, head_name, sub_head_name, icon, is_active)
VALUES
  ('marketing', 'Marketing Committee', 'لجنة التسويق', 'Operational', 'مسؤولة عن وضع الخطط التسويقية وحملات الترويج والوصول للجمهور المستهدف.', 'قائد التسويق', 'نائب قائد التسويق', 'Target', true),
  ('pr', 'Public Relations (PR)', 'لجنة العلاقات العامة', 'Academics & PR', 'بناء وإدارة الشراكات الأكاديمية والمؤسسية مع المستشفيات والشركات والجامعات.', 'قائد العلاقات العامة', 'نائب قائد العلاقات العامة', 'Users', true),
  ('media', 'Media & Content', 'لجنة الميديا وصناعة المحتوى', 'Tech & Media', 'إنتاج التصاميم والمونتاج والتغطيات الإعلامية وصناعة المحتوى العلمي والتوعوي.', 'قائد الميديا', 'نائب قائد الميديا', 'Camera', true),
  ('ir', 'Internal Relations (IR)', 'لجنة العلاقات الداخلية والمتابعة', 'Operational', 'متابعة وتقييم أداء أعضاء الكيان وتطوير الكفاءات وحل التحديات الداخلية.', 'مسؤول التقييم والمتابعة', 'نائب مسؤول التقييم', 'Award', true),
  ('event_planning', 'Event Planning & Operations', 'لجنة تنظيم الفعاليات', 'Operational', 'التخطيط اللوجستي والتنفيذي للمؤتمرات، ورش العمل، والمسابقات الصيدلانية.', 'قائد التنظيم', 'نائب قائد التنظيم', 'Calendar', true),
  ('secretary', 'Secretary & Documentation', 'لجنة السكرتارية والتوثيق', 'Operational', 'إدارة وتوثيق الاجتماعات، جداول المواعيد، الأرشيف الإداري، وسجلات الحضور.', 'أمين السر والتوثيق', 'نائب أمين السر', 'FileText', true),
  ('charity', 'Charity & Community Health', 'لجنة العمل الخيري والتوعية المجتمعية', 'Community & Charity', 'تنظيم القوافل الطبية وحملات التوعية الصحية وجمع التبرعات للأسر الأكثر احتياجاً.', 'قائد النشاط الخيري', 'نائب قائد النشاط الخيري', 'Heart', true),
  ('magic_hand', 'Magic Hand (Decor & Art)', 'لجنة الديكور واللمسات الإبداعية', 'Tech & Media', 'تصميم وتنسيق قاعات الفعاليات والمؤتمرات وإبراز الهوية البصرية للكيان.', 'قائد الإبداع والتنسيق', 'نائب قائد الإبداع', 'Palette', true),
  ('data_analysis', 'Data Analysis & Strategic Planning', 'لجنة تحليل البيانات والتخطيط الاستراتيجي', 'Academics & PR', 'تحليل استطلاعات الرأي وأداء الفعاليات ونمو الكيان وتقديم تقارير قيادية لاتخاذ القرار.', 'رئيس وحدة البيانات', 'نائب رئيس البيانات', 'TrendingUp', true)
ON CONFLICT (key) DO NOTHING;

-- Baseline Site Settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES
  ('certificate_signatory_name', 'Aliens High Board & Academic Committee'),
  ('certificate_signatory_title', 'President & Academic Lead'),
  ('recruitment_open', 'true'),
  ('contact_pr_phone', '+20 100 123 4567'),
  ('contact_email', 'contact@aliens-space.org'),
  ('hero_tagline', 'الكيان الأكاديمي والمهني الرائد لطلاب وخريجي كليات الصيدلة'),
  ('about_statement', 'كيان طلابي وأكاديمي متكامل يسعى لتمكين وتطوير طلاب الصيدلة من خلال ورش العمل، المؤتمرات، الأبحاث العلمية، والأنشطة القيادية والمجتمعية.'),
  ('academic_lead_name', 'د. كريم عبد العزيز')
ON CONFLICT (setting_key) DO NOTHING;
