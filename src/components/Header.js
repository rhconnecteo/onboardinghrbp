import React, { useState } from 'react';
import Logo from './Logo';

function Header({ toggleSidebar }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    toggleSidebar();
  };

  return (
    <header className="header">
      <button
        className={`hamburger-menu ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <Logo size={70} />
      <h1>Gestionnaire Collaborateurs - HRBP</h1>
    </header>
  );
}

export default Header;
