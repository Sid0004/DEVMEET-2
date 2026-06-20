import React from 'react';
import { ChatPillButton } from './Buttons';
import './Navigation.css';

export const HeaderNavigation = () => {
  return (
    <nav className="header-nav container">
      <div className="nav-left">
        <a href="/" className="nav-logo">Devmeet</a>
        <div className="nav-divider" />
        <ul className="nav-links">
          <li><a href="#services">SERVICES</a></li>
          <li><a href="#portfolio">PORTFOLIO</a></li>
          <li><a href="#process">PROCESS</a></li>
        </ul>
      </div>
      <div className="nav-right">
        <ChatPillButton onClick={() => console.log('Chat clicked')} />
      </div>
    </nav>
  );
};
