'use client';

import React, { useState } from 'react';
import '../css/settings.css';

const SettingSidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const settingsData = [
    {
      title: 'Account Setting',
      icon: 'fa-user-gear',
      items: [
        {
          name: 'Edit Profile',
          subItems: [
            'Change Name',
            'Change Username',
            'Bio',
            'Change Photo',
            'Delete Photo'
          ],
        },
        { name: 'Change Email' },
        { name: 'Change Password' },
        { name: 'Switch Account' },
        { name: 'Deactivate Account' },
        { name: 'Delete Account'},
        { name: 'Logout' },
      ],
    },
    {
      title: 'Privacy Setting',
      icon: 'fa-user-shield',
      items: [
        {
          name: 'Account Privacy',
          subItems: ['Public', 'Private'],
        },
        {
          name: 'Who can see my posts',
          subItems: ['Public', 'Friends', 'Only me'],
        },
        {
          name: 'Phone number & Birthday',
          subItems: ['Public', 'Friends', 'Only me'],
        },
        {
          name: 'Active status',
          subItems: ['Show', 'Hide'],
        },
      ],
    },    
    {
      title: 'Notification Setting',
      icon: 'fa-bell',
      items: [
        { name: 'Post notification' },
        { name: 'Message notification' },
        { name: 'Friend request notification' },
      ],
    },
    {
      title: 'Chat Setting',
      icon: 'fa-comments',
      items: [
        { name: 'Message request' },
        { name: 'Block unknown users' },
        { name: 'Delete chat history' },
      ],
    },
    {
      title: 'App Setting',
      icon: 'fa-palette',
      items: [
        { name: 'Appearance'},
        {
          name: 'Language',
          subItems: ['Myanmar', 'English'],
        }    
      ],
    },
    {
      title: 'Security',
      icon: 'fa-shield-halved',
      items: [
        { name: 'Two-factor authentication' },
        { name: 'Account health'},
        { name: 'Login activity' },
        { name: 'Logout from all devices' },
      ],
    },
  ];

  return (
    <div className="card">
      <div className="setting-page-wrapper">
        
        <header className="setting-container">
          <div className="setting-header">
            <div className="header-left">
              <span className="yukai-logo">yukai</span>
              <h1 className="main-title">愉快</h1>
            </div>

            <h2 className="page-label">
              Setting <i className="fa-solid fa-gear"></i>
            </h2>

          </div>
        </header>

        <div className="setting-content">
          {settingsData.map((section, index) => (
            <section key={index} className="setting-section">
              
              <div className="section-header">
                <h3 className="section-title">{section.title}</h3>
                <i className={`fa-solid ${section.icon} section-icon`}></i>
              </div>

              <div className="setting-card">
                <ul className="setting-list">
                  {section.items.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <li
                        className="setting-item"
                        onClick={() =>
                          item.subItems && toggleDropdown(item.name)
                        }
                      >
                        <span>{item.name}</span>
                        <i className={`fa-solid fa-chevron-right chevron-icon ${openDropdown === item.name ? 'rotate' : ''}`}></i>

                      </li>

                      {openDropdown === item.name && item.subItems && (
                        <div className="sub-menu-list">
                          {item.subItems.map((sub, sIdx) => (
                            <div key={sIdx} className="sub-item">
                              {sub}
                            </div>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
