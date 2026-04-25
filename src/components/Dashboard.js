import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import DashboardSection from './sections/DashboardSection';
import FormSection from './sections/FormSection';
import ImportSection from './sections/ImportSection';
import IncompleteSection from './sections/IncompleteSection';
import CollaboratorsSection from './sections/CollaboratorsSection';

function Dashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile: open/close
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop: collapse/expand

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false); // Close on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      // Mobile: open/close
      setSidebarOpen(!sidebarOpen);
    } else {
      // Desktop: collapse/expand
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const switchSection = (section) => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false); // Close sidebar on mobile when switching
    }
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className="app-container">
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <Sidebar
          activeSection={activeSection}
          onSectionChange={switchSection}
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onLogout={onLogout}
          onToggleCollapse={toggleCollapse}
        />
        <main className="main-content">
          <div
            className={`content-section ${
              activeSection === 'dashboard' ? 'active' : ''
            }`}
          >
            <DashboardSection />
          </div>

          <div
            className={`content-section ${
              activeSection === 'formulaire' ? 'active' : ''
            }`}
          >
            <FormSection />
          </div>

          <div
            className={`content-section ${
              activeSection === 'import' ? 'active' : ''
            }`}
          >
            <ImportSection />
          </div>

          <div
            className={`content-section ${
              activeSection === 'incomplets' ? 'active' : ''
            }`}
          >
            <IncompleteSection />
          </div>

          <div
            className={`content-section ${
              activeSection === 'collaborateurs' ? 'active' : ''
            }`}
          >
            <CollaboratorsSection />
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;
