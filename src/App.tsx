import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { HomeView } from './components/PublicViews/HomeView';
import { AboutView } from './components/PublicViews/AboutView';
import { CommitteesView } from './components/PublicViews/CommitteesView';
import { EventsView } from './components/PublicViews/EventsView';
import { CertificatesView } from './components/PublicViews/CertificatesView';
import { GalleryView } from './components/PublicViews/GalleryView';
import { ProjectsAndHubView } from './components/PublicViews/ProjectsAndHubView';
import { MemoriesView } from './components/PublicViews/MemoriesView';
import { DashboardCommandCenter } from './components/Dashboard/DashboardCommandCenter';

// Modals
import { RecruitmentModal } from './components/RecruitmentModal';
import { AuthModal } from './components/AuthModal';
import { AccessCodeModal } from './components/AccessCodeModal';
import { CertificateModal } from './components/CertificateModal';
import { TicketModal } from './components/TicketModal';
import { ProfileModal } from './components/ProfileModal';

// Types & Services
import { Profile, CertificateItem, EventItem, EventRegistration, CommitteeKey } from './types';
import { authService } from './services/authService';

export default function App() {
  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [currentSubRoute, setCurrentSubRoute] = useState<string>('overview');
  
  // User Session State
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Sidebar & Modals Visibility States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  const [recruitmentOpen, setRecruitmentOpen] = useState(false);
  const [recruitmentPrefillComm, setRecruitmentPrefillComm] = useState<CommitteeKey | undefined>(undefined);
  
  const [authOpen, setAuthOpen] = useState(false);
  const [accessCodeOpen, setAccessCodeOpen] = useState(false);
  
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<EventRegistration | null>(null);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<EventItem | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Initialize Session
  useEffect(() => {
    authService.getSession().then(user => {
      setCurrentUser(user);
    });
  }, []);

  // Handlers
  const handleNavigate = (route: string, subRoute?: string) => {
    // If navigating to dashboard without being logged in, prompt auth
    if (route === 'dashboard' && !currentUser) {
      setAuthOpen(true);
      return;
    }

    setCurrentRoute(route);
    if (subRoute) {
      setCurrentSubRoute(subRoute);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRecruitment = (commKey?: CommitteeKey) => {
    setRecruitmentPrefillComm(commKey);
    setRecruitmentOpen(true);
  };

  const handleOpenCertificate = (cert: CertificateItem) => {
    setSelectedCert(cert);
    setCertModalOpen(true);
  };

  const handleOpenTicket = (reg: EventRegistration, event: EventItem) => {
    setSelectedTicket(reg);
    setSelectedTicketEvent(event);
    setTicketModalOpen(true);
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setProfileModalOpen(false);
    setSidebarOpen(false);
    if (currentRoute === 'dashboard') {
      setCurrentRoute('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Global Sidebar Navigation Drawer */}
      <Sidebar
        currentUser={currentUser}
        currentRoute={currentRoute}
        currentSubRoute={currentSubRoute}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
        onOpenRecruitment={() => handleOpenRecruitment()}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenAccessCode={() => setAccessCodeOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenRecruitment={() => handleOpenRecruitment()}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenAccessCode={() => setAccessCodeOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSignOut={handleLogout}
      />

      {/* Main Viewport Content */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenRecruitment={handleOpenRecruitment}
            onViewCertificate={handleOpenCertificate}
          />
        )}

        {currentRoute === 'about' && (
          <AboutView
            onNavigate={handleNavigate}
            onOpenRecruitment={() => handleOpenRecruitment()}
          />
        )}

        {currentRoute === 'committees' && (
          <CommitteesView
            onOpenRecruitment={handleOpenRecruitment}
          />
        )}

        {currentRoute === 'events' && (
          <EventsView
            currentUser={currentUser}
            onOpenTicket={handleOpenTicket}
            onOpenCertificate={handleOpenCertificate}
            onOpenAuth={() => setAuthOpen(true)}
          />
        )}

        {currentRoute === 'verify' && (
          <CertificatesView
            onViewCertificate={handleOpenCertificate}
          />
        )}

        {currentRoute === 'gallery' && (
          <GalleryView />
        )}

        {currentRoute === 'hub' && (
          <ProjectsAndHubView />
        )}

        {currentRoute === 'memories' && (
          <MemoriesView
            currentUser={currentUser}
            onOpenAuth={() => setAuthOpen(true)}
          />
        )}

        {currentRoute === 'dashboard' && currentUser && (
          <DashboardCommandCenter
            currentUser={currentUser}
            initialTab={currentSubRoute}
            onOpenCertificate={handleOpenCertificate}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenRecruitment={() => handleOpenRecruitment()}
      />

      {/* MODALS */}
      <RecruitmentModal
        isOpen={recruitmentOpen}
        onClose={() => setRecruitmentOpen(false)}
        initialCommitteeKey={recruitmentPrefillComm}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      <AccessCodeModal
        isOpen={accessCodeOpen}
        onClose={() => setAccessCodeOpen(false)}
        currentUser={currentUser}
        onSuccess={(updated) => {
          setCurrentUser(updated);
        }}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updated) => {
          setCurrentUser(updated);
        }}
        onLogout={handleLogout}
      />

      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={selectedCert}
      />

      <TicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        registration={selectedTicket}
        event={selectedTicketEvent}
      />

    </div>
  );
}
