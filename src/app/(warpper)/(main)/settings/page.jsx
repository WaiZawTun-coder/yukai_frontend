// page.jsx
'use client';

import React, { useState } from 'react';
import ProfileSettings from './editprofile';
import ChangeEmail from './changeemail'; 
import ChangePassword from './changepassword';
import SwitchAccount from './switchaccount';
import WhoCanSeePosts from './whocanseeposts'; 
import PhoneNumberandBirthday from './phoneandnumbers';
import DeleteAccount from './deleteacccount';
import DeactivateAccount from './deactivateaccount';
import LogoutSettings from './logout';
import ChangePhoneNumber from './changephoneno';

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
    } else if (name === 'Change Phone Number') {
      setActivePage('ChangePhoneNumber');
    } else if (name === 'Who can see my posts') {
      setActivePage('whoCanSeePosts'); 
    } else if (name === 'Phone number & Birthday') {
      setActivePage('phoneNumberandBirthday'); 
    } else if (name === 'Two-factor authentication') {
      console.log('Two-factor authentication clicked');
    } else if (name === 'Account health') {
      console.log('Account health clicked');
    } else if (name === 'Login activity') {
      console.log('Login activity clicked');
    } else if (name === 'Appearance') {
      console.log('Appearance clicked');
    } else if (name === 'Deactivate Account') {
      setActivePage('DeactivateAccount');
    } else if (name === 'Delete Account') {
      setActivePage('DeleteAccount');
    } else if (name === 'Logout from all devices') {
      if (confirm('Are you sure you want to logout from all devices?')) {
        console.log('Logout from all devices requested');
      }
    } else if (name === 'Logout') {
      setActivePage('LogoutSettings');
    } else {
      console.log(`Clicked: ${name}`);
    }
  };

  // Get icon for each menu item
  const getMenuItemIcon = (name) => {
    switch(name) {
      case 'Edit Profile':
        return 'fa-user-pen';
      case 'Change Email':
        return 'fa-envelope';
      case 'Change Password':
        return 'fa-key';
      case 'Change Phone Number':
        return 'fa-phone';
      case 'Who can see my posts':
        return 'fa-eye';
      case 'Phone number & Birthday':
        return 'fa-calendar-day';
      case 'Two-factor authentication':
        return 'fa-shield-alt';
      case 'Account health':
        return 'fa-heart-pulse';
      case 'Login activity':
        return 'fa-clock-rotate-left';
      case 'Appearance':
        return 'fa-palette';
      case 'Delete Account':
        return 'fa-trash';
      case 'Deactivate Account':
        return 'fa-user-slash';
      case 'Logout from all devices':
        return 'fa-sign-out-alt';
      case 'Logout':
        return 'fa-right-from-bracket';
      default:
        return 'fa-cog';
    }
  };

  const settingsData = [
    {
      title: 'Account Setting',
      icon: 'fa-user-gear',
      items: [
        { name: 'Edit Profile' },
        { name: 'Change Email' },
        { name: 'Change Password' },
        { name: 'Change Phone Number' }
      ],
    },
    {
      title: 'Privacy Setting',
      icon: 'fa-user-shield',
      items: [
        { name: 'Who can see my posts' },
        { name: 'Phone number & Birthday' } 
      ],
    },    
    {
      title: 'App Setting',
      icon: 'fa-palette',
      items: [
        { name: 'Appearance' },
      ],
    },
    {
      title: 'Security',
      icon: 'fa-shield-halved',
      items: [
        { name: 'Two-factor authentication' },
        { name: 'Account health'},
        { name: 'Login activity' }
      ],
    },
    {
      title: 'Danger Zone',
      icon: 'fa-shield-halved',
      items: [
        { name: 'Delete Account' },
        { name: 'Deactivate Account'},
        { name: 'Logout from all devices' },
        { name: 'Logout' },
      ],
    }
  ];

  // Render ProfileSettings component when activePage is 'editProfile'
  if (activePage === 'editProfile') {
    return <ProfileSettings onBack={() => setActivePage('settings')} />;
  }

  // Render ChangeEmail component when activePage is 'changeEmail'
  if (activePage === 'changeEmail') {
    return <ChangeEmail onBack={() => setActivePage('settings')} />;
  }

  // Render ChangePassword component when activePage is 'changePassword'
  if (activePage === 'changePassword') {
    return <ChangePassword onBack={() => setActivePage('settings')} />;
  }

  // Render ChangePhoneNumber component when activePage is 'ChangePhoneNumber'
  if (activePage === 'ChangePhoneNumber') {
    return <ChangePhoneNumber onBack={() => setActivePage('settings')} />;
  }

  // Render WhoCanSeePosts component when activePage is 'whoCanSeePosts'
  if (activePage === 'whoCanSeePosts') {
    return <WhoCanSeePosts onBack={() => setActivePage('settings')} />;
  }

  // Render PhoneNumberandBirthday component when activePage is 'phoneNumberandBirthday'
  if (activePage === 'phoneNumberandBirthday') {
    return <PhoneNumberandBirthday onBack={() => setActivePage('settings')} />;
  }

  // Render DeleteAccount component when activePage is 'Delete Account'
  if (activePage === 'DeleteAccount') {
    return <DeleteAccount onBack={() => setActivePage('settings')} />;
  }

  // Render DeactivateAccount component when activePage is 'Deactivate Account'
  if (activePage === 'DeactivateAccount') {
    return <DeactivateAccount onBack={() => setActivePage('settings')} />;
  }

  // Render LogoutSettings component when activePage is 'LogoutSettings'
  if (activePage === 'LogoutSettings') {
    return <LogoutSettings onBack={() => setActivePage('settings')} />;
  }

  // Render settings sidebar
  return (
    <div className="card">
      <div className="setting-page-wrapper">
        <header className="setting-container">
          <div className="setting-header">
            <h2 className="page-label">
              <i className="fa-solid fa-gear"></i>
              Setting 
            </h2>
          </div>
        </header>

        <div className="setting-content">
          {settingsData.map((section, index) => (
            <section key={index} className="setting-section">
              <div className="section-header">
                {/* Icon moved BEFORE the title */}
                <i className={`fa-solid ${section.icon} section-icon`}></i>
                <h3 className="section-title">{section.title}</h3>
              </div>

              <div className="setting-card">
                <ul className="setting-list">
                  {section.items.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <li
                        className="setting-item"
                        onClick={() => handleMenuItemClick(item.name)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Icon before the text - NO background */}
                        <i className={`fa-solid ${getMenuItemIcon(item.name)} menu-item-icon`}></i>
                        
                        {/* Text */}
                        <span className="menu-item-text">{item.name}</span>
                        
                        {/* Chevron icon on the right */}
                        <i className={`fa-solid fa-chevron-right chevron-icon`}></i>
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