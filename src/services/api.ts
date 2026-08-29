import { authService } from './authService';
import { profileService } from './profileService';
import { membershipService } from './membershipService';
import { committeeService } from './committeeService';
import { questionService } from './questionService';
import { applicationService } from './applicationService';
import { irService } from './irService';
import { evaluationService } from './evaluationService';
import { eventService } from './eventService';
import { attendanceService } from './attendanceService';
import { certificateService } from './certificateService';
import { taskService } from './taskService';
import { galleryService } from './galleryService';
import { memoryService } from './memoryService';
import { analyticsService } from './analyticsService';
import { settingsService } from './settingsService';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

import {
  Profile,
  Committee,
  EventItem,
  EventRegistration,
  CertificateItem,
  TaskItem,
  DynamicQuestion,
  ApplicationItem,
  AccessCodeItem,
  IRAssignment,
  EvaluationItem,
  MemoryItem,
  GalleryAlbum,
  GalleryPhoto,
  ProjectItem,
  InternshipItem,
  CulturalResource,
  AuditLogItem,
  SiteSettings,
  UserRole,
  CommitteeKey
} from '../types';

export const ApiService = {
  // ==========================================
  // AUTH & SESSION MANAGEMENT (Supabase Auth Only)
  // ==========================================
  async getCurrentSession(): Promise<Profile | null> {
    return authService.getSession();
  },

  async signIn(identifier: string, password?: string): Promise<Profile> {
    return authService.signIn(identifier, password);
  },

  async signUp(email: string, fullName: string, username: string, password?: string): Promise<Profile> {
    return authService.signUp(email, fullName, username, password);
  },

  async signOut(): Promise<void> {
    return authService.signOut();
  },

  async resetPassword(email: string): Promise<void> {
    return authService.resetPassword(email);
  },

  // ==========================================
  // PROFILE MANAGEMENT
  // ==========================================
  async getProfile(userId: string): Promise<Profile | null> {
    return profileService.getProfile(userId);
  },

  async getAllProfiles(): Promise<Profile[]> {
    return profileService.getAllProfiles();
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    return profileService.updateProfile(userId, updates);
  },

  // ==========================================
  // ACCESS CODES & MEMBERSHIP
  // ==========================================
  async redeemAccessCode(codeStr: string, currentUser: Profile): Promise<Profile> {
    return membershipService.redeemAccessCode(codeStr, currentUser);
  },

  async getAccessCodes(): Promise<AccessCodeItem[]> {
    return membershipService.getAccessCodes();
  },

  async createAccessCode(codeData: Partial<AccessCodeItem>, actor?: Profile): Promise<AccessCodeItem> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return membershipService.createAccessCode(codeData, act);
  },

  async toggleAccessCode(id: string, isActive: boolean, actor?: Profile): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return membershipService.toggleAccessCode(id, isActive, act);
  },

  // ==========================================
  // COMMITTEES
  // ==========================================
  async getAllCommittees(): Promise<Committee[]> {
    return committeeService.getAllCommittees();
  },

  async getCommitteeByKey(key: CommitteeKey): Promise<Committee | null> {
    return committeeService.getCommitteeByKey(key);
  },

  async createCommittee(committeeData: Partial<Committee>, actor?: Profile): Promise<Committee> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return committeeService.createCommittee(committeeData, act);
  },

  async updateCommittee(id: string, updates: Partial<Committee>, actor?: Profile): Promise<Committee> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return committeeService.updateCommittee(id, updates, act);
  },

  // ==========================================
  // DYNAMIC QUESTIONS
  // ==========================================
  async getAllQuestions(): Promise<DynamicQuestion[]> {
    return questionService.getAllQuestions();
  },

  async getQuestionsByCommittee(committeeKey: string): Promise<DynamicQuestion[]> {
    return questionService.getQuestionsByCommittee(committeeKey);
  },

  async createQuestion(questionData: Partial<DynamicQuestion>, actor?: Profile): Promise<DynamicQuestion> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return questionService.createQuestion(questionData, act);
  },

  async updateQuestion(id: string, updates: Partial<DynamicQuestion>, actor?: Profile): Promise<DynamicQuestion> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return questionService.updateQuestion(id, updates, act);
  },

  async deleteQuestion(id: string, actor?: Profile): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return questionService.deleteQuestion(id, act);
  },

  // ==========================================
  // APPLICATIONS & RECRUITMENT
  // ==========================================
  async getApplications(filters?: any): Promise<ApplicationItem[]> {
    return applicationService.getApplications(filters);
  },

  async submitApplication(appData: Partial<ApplicationItem>): Promise<ApplicationItem> {
    return applicationService.submitApplication(appData);
  },

  async updateApplicationStatus(id: string, status: any, actor?: Profile, committeeNotes?: string): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return applicationService.updateApplicationStatus(id, status, act, committeeNotes);
  },

  async shiftApplicant(id: string, targetCommitteeKey: CommitteeKey, reason: string, actor?: Profile): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return applicationService.shiftApplicant(id, targetCommitteeKey, reason, act);
  },

  // ==========================================
  // IR OPERATIONS & ASSIGNMENTS
  // ==========================================
  async getEligibleEvaluators() {
    return irService.getEligibleEvaluators();
  },

  async getIRAssignments(): Promise<IRAssignment[]> {
    return irService.getActiveAssignments();
  },

  async getAssignmentHistory(): Promise<IRAssignment[]> {
    return irService.getAssignmentHistory();
  },

  async getUnassignedMembers(): Promise<Profile[]> {
    return irService.getUnassignedMembers();
  },

  async assignMember(memberId: string, evaluatorId: string, actor?: Profile): Promise<IRAssignment> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return irService.assignMember(memberId, evaluatorId, act);
  },

  async unassignMember(memberId: string, actor?: Profile): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return irService.unassignMember(memberId, act);
  },

  async reassignMember(memberId: string, newEvaluatorId: string, actor?: Profile): Promise<IRAssignment> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return irService.reassignMember(memberId, newEvaluatorId, act);
  },

  async assignApplicant(appId: string, evaluatorId: string, actor?: Profile): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return irService.assignApplicant(appId, evaluatorId, act);
  },

  async unassignApplicant(appId: string, actor?: Profile): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return irService.unassignApplicant(appId, act);
  },

  async submitApplicantReview(appId: string, review: any, actor?: Profile): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return irService.submitApplicantReview(appId, review, act);
  },

  // ==========================================
  // PERFORMANCE EVALUATIONS
  // ==========================================
  async getEvaluations(currentUser?: Profile): Promise<EvaluationItem[]> {
    return evaluationService.getAllEvaluations(currentUser);
  },

  async getMemberEvaluations(memberId: string): Promise<EvaluationItem[]> {
    return evaluationService.getMemberEvaluations(memberId);
  },

  async submitEvaluation(evalData: any, actor?: Profile): Promise<EvaluationItem> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return evaluationService.submitMonthlyEvaluation(evalData, act);
  },

  // ==========================================
  // EVENTS & ATTENDANCE
  // ==========================================
  async getEvents(): Promise<EventItem[]> {
    return eventService.getEvents();
  },

  async getEventById(id: string): Promise<EventItem | null> {
    return eventService.getEventById(id);
  },

  async createEvent(eventData: Partial<EventItem>, actor?: Profile): Promise<EventItem> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return eventService.createEvent(eventData, act);
  },

  async updateEvent(id: string, updates: Partial<EventItem>, actor?: Profile): Promise<EventItem> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return eventService.updateEvent(id, updates, act);
  },

  async deleteEvent(id: string, actor?: Profile): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return eventService.deleteEvent(id, act);
  },

  async getRegistrations(eventId?: string): Promise<EventRegistration[]> {
    return attendanceService.getRegistrations(eventId);
  },

  async registerForEvent(eventId: string, registrantName: string, phone: string, email?: string, userId?: string): Promise<EventRegistration> {
    return attendanceService.registerForEvent(eventId, registrantName, phone, email, userId);
  },

  async updateAttendance(registrationId: string, status: 'attended' | 'not_completed', actor?: Profile): Promise<EventRegistration> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return attendanceService.updateAttendance(registrationId, status, act);
  },

  // ==========================================
  // CERTIFICATES
  // ==========================================
  async getAllCertificates(): Promise<CertificateItem[]> {
    return certificateService.getAllCertificates();
  },

  async verifyCertificate(code: string): Promise<CertificateItem | null> {
    return certificateService.getCertificateByVerificationCode(code);
  },

  async issueCertificateForRegistration(registration: EventRegistration, actor?: Profile): Promise<CertificateItem> {
    return certificateService.issueCertificateForRegistration(registration, actor);
  },

  // ==========================================
  // TASKS
  // ==========================================
  async getTasks(committeeKey?: string): Promise<TaskItem[]> {
    return taskService.getTasks(committeeKey);
  },

  async createTask(taskData: Partial<TaskItem>, actor?: Profile): Promise<TaskItem> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return taskService.createTask(taskData, act);
  },

  async updateTaskStatus(taskId: string, status: 'todo' | 'in_progress' | 'completed', actor?: Profile): Promise<TaskItem> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return taskService.updateTaskStatus(taskId, status, act);
  },

  async deleteTask(taskId: string, actor?: Profile): Promise<void> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return taskService.deleteTask(taskId, act);
  },

  // ==========================================
  // SOCIAL, GALLERY & KNOWLEDGE
  // ==========================================
  async getMemories(): Promise<MemoryItem[]> {
    return memoryService.getMemories();
  },

  async createMemory(text: string, imageUrl?: string, author?: Profile): Promise<MemoryItem> {
    return memoryService.createMemory(text, imageUrl, author);
  },

  async likeMemory(memoryId: string): Promise<number> {
    return memoryService.likeMemory(memoryId);
  },

  async addCommentToMemory(memoryId: string, text: string, author?: Profile): Promise<any> {
    return memoryService.addComment(memoryId, text, author);
  },

  async getGalleryAlbums(): Promise<GalleryAlbum[]> {
    return galleryService.getAlbums();
  },

  async getGalleryPhotos(): Promise<GalleryPhoto[]> {
    return galleryService.getPhotos();
  },

  async getProjects(): Promise<ProjectItem[]> {
    return analyticsService.getProjects();
  },

  async getInternships(): Promise<InternshipItem[]> {
    return analyticsService.getInternships();
  },

  async getArticles(): Promise<CulturalResource[]> {
    return analyticsService.getArticles();
  },

  // ==========================================
  // SETTINGS & AUDIT
  // ==========================================
  async getSiteSettings(): Promise<SiteSettings> {
    return settingsService.getSiteSettings();
  },

  async updateSiteSettings(settings: Partial<SiteSettings>, actor?: Profile): Promise<SiteSettings> {
    const act = actor || (await authService.getSession()) || { id: 'admin', full_name: 'Admin', role: 'OG' as UserRole, username: 'admin', email: 'admin@aliens-space.org' };
    return settingsService.updateSiteSettings(settings, act);
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    return auditService.getAuditLogs();
  },

  async logAudit(log: Partial<AuditLogItem>): Promise<void> {
    return auditService.logAction(log);
  }
};
