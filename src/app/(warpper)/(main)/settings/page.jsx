// page.jsx
'use client';

import React, { useState } from 'react';
import ProfileSettings from './editprofile';
import ChangeEmail from './changeemail'; // Import the new component
import ChangePassword from './changepassword';

import '../../../css/settings.css';

const SettingSidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activePage, setActivePage] = useState('settings'); // Track active page

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleMenuItemClick = (name) => {
    if (name === 'Edit Profile') {
      setActivePage('editProfile');
    } else if (name === 'Change Email') {
      setActivePage('changeEmail');
    } else if (name === 'Change Password') {
      setActivePage('changePassword');
      
    } else if (name === 'Deactivate Account') {
      if (confirm('Are you sure you want to deactivate your account?')) {
        console.log('Account deactivation requested');
      }
    } else if (name === 'Delete Account') {
      if (confirm('⚠️ WARNING: This will permanently delete your account. This action cannot be undone. Are you sure?')) {
        console.log('Account deletion requested');
      }
    } else if (name === 'Logout') {
      if (confirm('Are you sure you want to logout?')) {
        console.log('User logged out');
        // Add your logout logic here
      }
    } else {
      console.log(`Clicked: ${name}`);
    }
  };

  const settingsData = [
    {
      title: 'Account Setting',
      icon: 'fa-user-gear',
      items: [
        {
          name: 'Edit Profile',
        },
        { name: 'Change Email' },
        { name: 'Change Password' },
        { name: 'Switch Account' },
        { name: 'Deactivate Account' },
        { name: 'Delete Account'}
       
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

  // Render ProfileSettings component when activePage is 'editProfile'
  if (activePage === 'editProfile') {
    return <ProfileSettings onBack={() => setActivePage('settings')} />;
  }

  // Render ChangeEmail component when activePage is 'changeEmail'
  if (activePage === 'changeEmail') {
    return <ChangeEmail onBack={() => setActivePage('settings')} />;
  }
  //Render ChangeEmail component when activePage is 'changeEmail'
  if (activePage === 'changePassword') {
    return <ChangePassword onBack={() => setActivePage('settings')} />;
  }
  // Render settings sidebar
  return (
    <div className="card">
      <div className="setting-page-wrapper">
        <header className="setting-container">
          <div className="setting-header">
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
                        onClick={() => {
                          if (item.subItems) {
                            toggleDropdown(item.name);
                          } else {
                            handleMenuItemClick(item.name);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <span>{item.name}</span>
                        {item.subItems && (
                          <i className={`fa-solid fa-chevron-right chevron-icon ${openDropdown === item.name ? 'rotate' : ''}`}></i>
                        )}
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

export default SettingSidebar;