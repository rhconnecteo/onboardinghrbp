import React from 'react';
import {
  FormIcon,
  ImportIcon,
  ChecklistIcon,
  PeopleIcon,
  LogoutIcon,
  CollapseIcon,
  DashboardIcon,
} from './Icons';

function Sidebar({ activeSection, onSectionChange, isOpen, isCollapsed, onLogout, onToggleCollapse }) {
  const sections = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: DashboardIcon },
    { id: 'formulaire', label: 'Formulaire', icon: FormIcon },
    { id: 'import', label: 'Importer Excel', icon: ImportIcon },
    { id: 'incomplets', label: 'À Compléter', icon: ChecklistIcon },
    { id: 'collaborateurs', label: 'Collaborateurs', icon: PeopleIcon },
  ];

  const userEmail = sessionStorage.getItem('userEmail') || 'Utilisateur';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Agrandir' : 'Réduire'}
        >
          <CollapseIcon />
        </button>
      </div>

      <div className="sidebar-nav">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              className={`sidebar-nav-btn ${
                activeSection === section.id ? 'active' : ''
              }`}
              onClick={() => onSectionChange(section.id)}
              data-section={section.id}
              title={section.label}
            >
              <IconComponent />
              <span className="sidebar-label">{section.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-spacer"></div>
      <div className="sidebar-separator"></div>

      <div className="sidebar-user">
        <div className="user-avatar">👤</div>
        <span className="sidebar-label user-name">{userEmail}</span>
      </div>

      <button
        className="sidebar-logout-btn"
        onClick={onLogout}
        title="Se déconnecter"
      >
        <LogoutIcon />
        <span className="sidebar-label">Déconnexion</span>
      </button>
    </aside>
  );
}

export default Sidebar;
