-- ==============================================================================
-- ALIENS SPACE — COMPLETE SUPABASE DATABASE SETUP & MIGRATION SCRIPT
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- It creates all required tables, constraints, triggers, indexes, and RLS policies.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE CANONICAL TABLES
-- ==============================================================================

-- 2.1 PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'registered_user',
  committee_key TEXT,
  committee_position TEXT,
  assigned_ir UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_evaluator BOOLEAN NOT NULL DEFAULT false,
  phone TEXT,
  student_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 COMMITTEES TABLE
CREATE TABLE IF NOT EXISTS public.committees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 ACCESS CODES (PROMO CODES FOR MEMBERSHIP REDEMPTION)
CREATE TABLE IF NOT EXISTS public.access_codes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  target_role TEXT NOT NULL,
  committee_key TEXT,
  committee_position TEXT,
  max_uses INT NOT NULL DEFAULT 1,
  current_uses INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 ACCESS CODE REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.access_code_redemptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code_id BIGINT REFERENCES public.access_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_code_user UNIQUE (code_id, user_id)
);

-- 2.5 DYNAMIC QUESTIONS (RECRUITMENT APPLICATION QUESTIONS)
CREATE TABLE IF NOT EXISTS public.dynamic_questions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  committee_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 RECRUITMENT APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  faculty_level TEXT NOT NULL,
  committee_key TEXT NOT NULL,
  committee_name TEXT NOT NULL,
  dynamic_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_snapshots JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  ir_status TEXT NOT NULL DEFAULT 'pending',
  ir_assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ir_notes TEXT,
  committee_decision TEXT NOT NULL DEFAULT 'pending',
  committee_notes TEXT,
  shift_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 IR ASSIGNMENTS (INTERNAL RELATIONS MEMBER DISTRIBUTION)
CREATE TABLE IF NOT EXISTS public.ir_assignments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.8 PERFORMANCE EVALUATIONS
CREATE TABLE IF NOT EXISTS public.performance_evaluations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  evaluation_month TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_member_month UNIQUE (member_id, evaluation_month)
);

-- 2.9 EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  action_link TEXT,
  committee_key TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT true,
  capacity INT,
  whatsapp_group_url TEXT,
  certificate_enabled BOOLEAN NOT NULL DEFAULT false,
  event_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 EVENT REGISTRATIONS & ATTENDANCE
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  registrant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  ticket_code TEXT UNIQUE NOT NULL,
  attendance_status TEXT NOT NULL DEFAULT 'registered',
  attendance_marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  attendance_marked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.11 CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id BIGINT NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verification_code TEXT UNIQUE NOT NULL,
  event_title TEXT,
  event_date TIMESTAMPTZ,
  signatory_name TEXT,
  signatory_title TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cert_registration UNIQUE (registration_id)
);

-- 2.12 TASKS (COMMITTEE WORKSPACE)
CREATE TABLE IF NOT EXISTS public.tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  committee_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'todo',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.13 MEMORIES & FEED
CREATE TABLE IF NOT EXISTS public.memories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT,
  author_name TEXT,
  author_avatar TEXT,
  memory_text TEXT NOT NULL,
  image_url TEXT,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.memory_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  memory_id BIGINT NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id TEXT,
  author_name TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.14 GALLERY ALBUMS
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  category TEXT DEFAULT 'General',
  photos_count INT NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.15 SITE SETTINGS (KEY-VALUE PAIRS)
CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.16 AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.17 MEMBER PROJECTS, INTERNSHIPS, & CULTURAL RESOURCES
CREATE TABLE IF NOT EXISTS public.member_projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  author_name TEXT,
  committee TEXT,
  description TEXT,
  tags TEXT[],
  link_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internships (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT,
  duration TEXT,
  requirements TEXT[],
  apply_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cultural_resources (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  author TEXT,
  read_time TEXT,
  summary TEXT,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==============================================================================
-- 3. AUTOMATIC PROFILE TRIGGER ON USER SIGNUP (SAFE & NON-BLOCKING)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  extracted_username TEXT;
  extracted_fullname TEXT;
BEGIN
  extracted_fullname := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  extracted_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username,
    role,
    is_evaluator,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    extracted_fullname,
    extracted_username,
    'registered_user',
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Crucial: Catch any trigger exceptions so auth.signUp NEVER fails with "Database error saving new user"
  RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
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

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users and Admins can update profiles" ON public.profiles;
CREATE POLICY "Users and Admins can update profiles" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OG', 'head', 'ir_head'))
);

-- Public Read Tables Policies
DROP POLICY IF EXISTS "Committees read access" ON public.committees;
CREATE POLICY "Committees read access" ON public.committees FOR SELECT USING (true);
DROP POLICY IF EXISTS "Committees write access" ON public.committees;
CREATE POLICY "Committees write access" ON public.committees FOR ALL USING (true);

DROP POLICY IF EXISTS "Events read access" ON public.events;
CREATE POLICY "Events read access" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Events write access" ON public.events;
CREATE POLICY "Events write access" ON public.events FOR ALL USING (true);

DROP POLICY IF EXISTS "Dynamic questions read access" ON public.dynamic_questions;
CREATE POLICY "Dynamic questions read access" ON public.dynamic_questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Dynamic questions write access" ON public.dynamic_questions FOR ALL USING (true);

DROP POLICY IF EXISTS "Applications insert access" ON public.applications;
CREATE POLICY "Applications insert access" ON public.applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Applications select access" ON public.applications;
CREATE POLICY "Applications select access" ON public.applications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Applications update access" ON public.applications;
CREATE POLICY "Applications update access" ON public.applications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Event registrations all" ON public.event_registrations;
CREATE POLICY "Event registrations all" ON public.event_registrations FOR ALL USING (true);

DROP POLICY IF EXISTS "Certificates all" ON public.certificates;
CREATE POLICY "Certificates all" ON public.certificates FOR ALL USING (true);

DROP POLICY IF EXISTS "Access codes all" ON public.access_codes;
CREATE POLICY "Access codes all" ON public.access_codes FOR ALL USING (true);

DROP POLICY IF EXISTS "Access code redemptions all" ON public.access_code_redemptions;
CREATE POLICY "Access code redemptions all" ON public.access_code_redemptions FOR ALL USING (true);

DROP POLICY IF EXISTS "IR assignments all" ON public.ir_assignments;
CREATE POLICY "IR assignments all" ON public.ir_assignments FOR ALL USING (true);

DROP POLICY IF EXISTS "Evaluations all" ON public.performance_evaluations;
CREATE POLICY "Evaluations all" ON public.performance_evaluations FOR ALL USING (true);

DROP POLICY IF EXISTS "Tasks all" ON public.tasks;
CREATE POLICY "Tasks all" ON public.tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Memories all" ON public.memories;
CREATE POLICY "Memories all" ON public.memories FOR ALL USING (true);

DROP POLICY IF EXISTS "Memory comments all" ON public.memory_comments;
CREATE POLICY "Memory comments all" ON public.memory_comments FOR ALL USING (true);

DROP POLICY IF EXISTS "Gallery albums all" ON public.gallery_albums;
CREATE POLICY "Gallery albums all" ON public.gallery_albums FOR ALL USING (true);

DROP POLICY IF EXISTS "Site settings all" ON public.site_settings;
CREATE POLICY "Site settings all" ON public.site_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Audit logs all" ON public.audit_logs;
CREATE POLICY "Audit logs all" ON public.audit_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Member projects all" ON public.member_projects;
CREATE POLICY "Member projects all" ON public.member_projects FOR ALL USING (true);

DROP POLICY IF EXISTS "Internships all" ON public.internships;
CREATE POLICY "Internships all" ON public.internships FOR ALL USING (true);

DROP POLICY IF EXISTS "Cultural resources all" ON public.cultural_resources;
CREATE POLICY "Cultural resources all" ON public.cultural_resources FOR ALL USING (true);


-- ==============================================================================
-- 5. INITIAL SEED DATA (COMMITTEES, QUESTIONS, SETTINGS, CODES)
-- ==============================================================================

-- Seed Committees
INSERT INTO public.committees (key, name, name_ar, description, icon, color, is_active)
VALUES
  ('marketing', 'Marketing Committee', 'لجنة التسويق وإدارة الحملات', 'بناء الخطط التسويقية وإدارة العلامة التجارية واستراتيجيات الترويج.', 'Megaphone', 'from-amber-500 to-orange-600', true),
  ('pr', 'Public Relations (PR)', 'لجنة العلاقات العامة والرعايات', 'التواصل مع الرعاة، الشخصيات العامة، وتنسيق الشراكات المؤسسية.', 'Handshake', 'from-blue-500 to-cyan-600', true),
  ('media', 'Media & Content', 'لجنة الميديا وصناعة المحتوى', 'التصوير، المونتاج، التصميم الجرافيكي، وكتابة المحتوى التفاعلي.', 'Camera', 'from-purple-500 to-pink-600', true),
  ('ir', 'Internal Relations (IR)', 'لجنة الموارد البشرية والعلاقات الداخلية', 'متابعة أداء الأعضاء، الدعم النفسي، التقييم الشهري، وتنظيم بيئة العمل.', 'Users', 'from-emerald-500 to-teal-600', true),
  ('event_planning', 'Event Planning & Logistics', 'لجنة تنظيم وإدارة الفعاليات', 'إدارة القاعات، الإشراف الميداني على المؤتمرات وورش العمل.', 'Calendar', 'from-rose-500 to-red-600', true),
  ('secretary', 'Secretary & Documentation', 'لجنة السكرتارية والتوثيق', 'إدارة محاضر الاجتماعات، التقارير، وقواعد البيانات الرسمية.', 'FileText', 'from-indigo-500 to-violet-600', true),
  ('charity', 'Charity & Community Work', 'لجنة العمل الخيري والمجتمعي', 'تنظيم القوافل الطبية والمبادرات الخيرية والتوعية الصحية.', 'HeartHandshake', 'from-green-500 to-emerald-700', true),
  ('magic_hand', 'Magic Hand (Handmade & Decor)', 'لجنة الماجيك هاند والديكور', 'تصميم وتنفيذ الهدايا والديكورات والأعمال اليدوية للفعاليات.', 'Sparkles', 'from-yellow-500 to-amber-600', true),
  ('data_analysis', 'Data Analysis & Tech', 'لجنة تحليل البيانات والتطوير التقني', 'إدارة المنصات البرمجية، تحليل استبيانات الطلاب، وأتمتة العمليات.', 'BarChart3', 'from-cyan-500 to-blue-700', true)
ON CONFLICT (key) DO NOTHING;

-- Seed Dynamic Questions
INSERT INTO public.dynamic_questions (committee_key, question_text, order_index, is_active)
VALUES
  ('global', 'لماذا ترغب في الانضمام إلى Aliens Space تحديداً وما الذي تتوقع تحقيقه معنا؟', 1, true),
  ('global', 'ما هي خبراتك السابقة في الأنشطة الطلابية أو الأعمال التطوعية؟', 2, true),
  ('marketing', 'كيف تخطط لحملة تسويقية لمؤتمر صيدلي يستهدف 1000 طالب؟', 1, true),
  ('marketing', 'ما الفرق بين التسويق بالمحتوى والتسويق المباشر من وجهة نظرك؟', 2, true),
  ('pr', 'كيف تتصرف إذا اعتذر متحدث رئيسي قبل موعد الفعالية بساعات قليلة؟', 1, true),
  ('pr', 'ما هي استراتيجيتك للتفاوض مع شركة راعية للمؤتمر السنوي؟', 2, true),
  ('media', 'ما هي البرامج والأدوات التي تجيد استخدامها (Photoshop, Premiere, Canva, etc.)؟ أرفق رابط لمعرض أعمالك إن وجد.', 1, true),
  ('ir', 'كيف تتعامل مع عضو في الفريق يمر بضغط نفسي أو يقل أداؤه فجأة؟', 1, true),
  ('ir', 'ما هي معاييرك لتقييم أداء الأعضاء بشكل موضوعي وغير منحاز؟', 2, true),
  ('event_planning', 'ما هي الإجراءات اللوجستية التي تتخذها قبل بدء أي ورشة عمل بـ 24 ساعة؟', 1, true),
  ('charity', 'ما هي أفكارك لتنظيم قافلة طبية توعوية بأقل ميزانية وأعلى أثر؟', 1, true),
  ('data_analysis', 'ما هي أدواتك المفضلة لتحليل البيانات وتطوير الويب (Excel, Python, SQL, React)؟', 1, true)
ON CONFLICT DO NOTHING;

-- Seed Default Site Settings
INSERT INTO public.site_settings (setting_key, setting_value, updated_at)
VALUES
  ('certificate_signatory_name', 'Aliens High Board & Academic Committee', NOW()),
  ('certificate_signatory_title', 'President & Academic Lead', NOW()),
  ('recruitment_open', 'true', NOW()),
  ('contact_pr_phone', '+20 100 123 4567', NOW()),
  ('contact_email', 'contact@aliens-space.org', NOW()),
  ('hero_tagline', 'الكيان الأكاديمي والمهني الرائد لطلاب وخريجي كليات الصيدلة', NOW()),
  ('about_statement', 'كيان طلابي وأكاديمي متكامل يسعى لتمكين وتطوير طلاب الصيدلة من خلال ورش العمل، المؤتمرات، الأبحاث العلمية، والأنشطة القيادية والمجتمعية.', NOW()),
  ('academic_lead_name', 'د. كريم عبد العزيز', NOW())
ON CONFLICT (setting_key) DO NOTHING;

-- Seed Starter Access Codes (For Admin/OG and Head access)
INSERT INTO public.access_codes (code, target_role, committee_key, committee_position, max_uses, current_uses, is_active)
VALUES
  ('ALIENS-OG-2026', 'OG', NULL, 'High Board Leader', 50, 0, true),
  ('IR-HEAD-2026', 'ir_head', 'ir', 'Head of IR', 10, 0, true),
  ('IR-EVAL-2026', 'ir_evaluator', 'ir', 'IR Evaluator', 30, 0, true),
  ('MARKETING-HEAD-2026', 'head', 'marketing', 'Head of Marketing', 5, 0, true),
  ('PR-HEAD-2026', 'head', 'pr', 'Head of PR', 5, 0, true),
  ('MEDIA-HEAD-2026', 'head', 'media', 'Head of Media', 5, 0, true),
  ('MEMBER-WELCOME-2026', 'member', 'event_planning', 'Member', 100, 0, true)
ON CONFLICT (code) DO NOTHING;
