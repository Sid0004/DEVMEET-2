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
          <li><a href="#services">ABOUT</a></li>
          <li><a href="#portfolio">DOCUMENTS</a></li>
          <li><a href="#process">SERVICES</a></li>
        </ul>
      </div>
      <div className="nav-right">
        <ChatPillButton onClick={() => console.log('Chat clicked')} />
      </div>
    </nav>
  );
};
