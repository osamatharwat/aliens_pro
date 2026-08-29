export type CommitteeKey = 
  | 'marketing' 
  | 'pr' 
  | 'media' 
  | 'ir' 
  | 'event_planning' 
  | 'secretary' 
  | 'charity' 
  | 'magic_hand' 
  | 'data_analysis';

export type UserRole = 
  | 'OG' 
  | 'team_head' 
  | 'team_sub_head' 
  | 'ir_head' 
  | 'ir_sub_head' 
  | 'head' 
  | 'sub_head' 
  | 'ir_evaluator' 
  | 'member' 
  | 'registered_user' 
  | 'guest';

export type CommitteePosition = 'Head' | 'Sub Head' | 'Member';

export interface Profile {
  id: string;
  user_id?: string;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  committee_key?: CommitteeKey | string;
  committee_position?: CommitteePosition;
  avatar_url?: string;
  phone?: string;
  student_id?: string;
  assigned_ir?: string; // Evaluator profile ID
  is_evaluator?: boolean;
  created_at?: string;
}

export interface Committee {
  id: string;
  key: CommitteeKey;
  name: string;
  arabic_name: string;
  category: 'Operational' | 'Tech & Media' | 'Academics & PR' | 'Community & Charity';
  description: string;
  goals: string[];
  requirements: string[];
  head_name: string;
  sub_head_name: string;
  active_members_count: number;
  icon_name?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url?: string;
  category: 'technical' | 'clinical' | 'soft_skills' | 'workshop' | 'hackathon';
  is_public: boolean;
  is_published: boolean;
  certificate_enabled: boolean;
  registration_open: boolean;
  capacity: number;
  current_attendees_count: number;
  whatsapp_group_url?: string;
  action_link?: string;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id?: string;
  registrant_name: string;
  phone: string;
  email?: string;
  ticket_code: string;
  attendance_status: 'registered' | 'attended' | 'not_completed';
  attendance_marked_by?: string;
  attendance_marked_at?: string;
  created_at: string;
}

export interface CertificateItem {
  id: string;
  event_id: string;
  registration_id: string;
  verification_code: string;
  recipient_name: string;
  event_title: string;
  event_date: string;
  signatory_name: string;
  signatory_title: string;
  issued_at: string;
  user_id?: string;
}

export interface TaskItem {
  id: string;
  committee_key: CommitteeKey;
  title: string;
  description?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: string;
  created_by?: string;
  created_at: string;
}

export interface DynamicQuestion {
  id: string;
  committee_key: CommitteeKey | 'global' | 'ir';
  question_text: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface ApplicationItem {
  id: string;
  applicant_name: string;
  phone: string;
  email: string;
  faculty_level: string;
  committee_key: CommitteeKey;
  committee_name: string;
  dynamic_answers: Record<string, string>;
  question_snapshots?: Array<{ id: string; question_text: string }>;
  status: 'new' | 'in_review' | 'accepted' | 'rejected' | 'shifted';
  ir_status: 'pending' | 'accepted' | 'rejected';
  ir_assignee_id?: string;
  ir_notes?: string;
  committee_decision: 'pending' | 'accepted' | 'rejected' | 'shifted';
  committee_notes?: string;
  shift_history: Array<{
    from_committee: string;
    to_committee: string;
    shifted_by: string;
    shifted_at: string;
    reason?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface AccessCodeItem {
  id: string;
  code: string;
  target_role: UserRole;
  committee_key: CommitteeKey | 'none';
  committee_position: CommitteePosition;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at?: string;
  created_by?: string;
  created_at: string;
}

export interface IRAssignment {
  id: string;
  evaluator_id: string;
  evaluator_name?: string;
  member_id: string;
  member_name?: string;
  member_committee?: string;
  assigned_by: string;
  status: 'active' | 'reassigned' | 'completed';
  assigned_at: string;
}

export interface EvaluationItem {
  id: string;
  member_id: string;
  member_name?: string;
  member_committee?: string;
  evaluator_id: string;
  evaluator_name?: string;
  evaluation_month: string; // e.g. "2026-08"
  score: number; // 0 - 100
  criteria_scores?: {
    commitment: number;
    communication: number;
    task_quality: number;
    initiative: number;
  };
  notes?: string;
  created_at: string;
}

export interface MemoryItem {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  memory_text: string;
  image_url?: string;
  likes_count: number;
  user_liked?: boolean;
  created_at: string;
  comments: Array<{
    id: string;
    user_id: string;
    author_name: string;
    comment_text: string;
    created_at: string;
  }>;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  category: string;
  photos_count: number;
  images: Array<{
    id: string;
    image_url: string;
    caption?: string;
    likes: number;
  }>;
  created_at: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  author_name: string;
  committee: string;
  description: string;
  tags: string[];
  link_url?: string;
  image_url?: string;
  created_at: string;
}

export interface InternshipItem {
  id: string;
  company_name: string;
  role_title: string;
  location: string;
  duration: string;
  requirements: string[];
  apply_link: string;
  is_active: boolean;
  created_at: string;
}

export interface CulturalResource {
  id: string;
  title: string;
  category: 'Scientific Article' | 'Soft Skills Guide' | 'Clinical Pharmacology' | 'Leadership';
  author: string;
  read_time: string;
  summary: string;
  content: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_name: string;
  actor_role: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: string;
  created_at: string;
}

export interface SiteSettings {
  certificate_signatory_name: string;
  certificate_signatory_title: string;
  recruitment_open: boolean;
  contact_pr_phone: string;
  contact_email: string;
  hero_tagline: string;
  about_statement: string;
  academic_lead_name: string;
}

export type CommitteeTask = TaskItem;
export type GalleryPhoto = { id: string; image_url: string; caption?: string; likes: number };
export type ArticleItem = CulturalResource;
