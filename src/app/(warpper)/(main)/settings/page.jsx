// page.jsx
'use client';

import React, { useState } from 'react';

import ThemeToggle from '@/components/ThemeToggle';
import Button from '@/components/ui/Button';
import Popup from '@/components/ui/Popup';
import { useAuth } from '@/context/AuthContext';
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import BlockIcon from "@mui/icons-material/Block";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HistoryIcon from "@mui/icons-material/History";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from 'next/navigation';


const SettingSidebar = () => {
  const { logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [logoutPopupOpen, setLogoutPopupOpen] = useState(false);
  const router = useRouter();

  // Get icon for each menu item
  const getMenuItemIcon = (name) => {
    switch (name) {
      case "Edit Profile":
        return <PersonIcon fontSize="small" />;
      case "Change Email":
        return <EmailIcon fontSize="small" />;
      case "Change Password":
        return <KeyIcon fontSize="small" />;
      case "Change Phone Number":
        return <PhoneIcon fontSize="small" />;
      case "Who can see my posts":
        return <VisibilityIcon fontSize="small" />;
      case "Phone number & Birthday":
        return <CalendarMonthIcon fontSize="small" />;
      case "Two-factor authentication":
        return <SecurityIcon fontSize="small" />;
      case "Account health":
        return <FavoriteIcon fontSize="small" />;
      case "Login activity":
        return <HistoryIcon fontSize="small" />;
      case "Appearance":
        return <PaletteIcon fontSize="small" />;
      case "Delete Account":
        return <DeleteIcon fontSize="small" />;
      case "Deactivate Account":
        return <BlockIcon fontSize="small" />;
      case "Logout from all devices":
        return <LogoutIcon fontSize="small" />;
      case "Logout":
        return <LogoutIcon fontSize="small" />;
      default:
        return <SettingsIcon fontSize="small" />;
    }
  };

  const getSectionIcon = (title) => {
    switch (title) {
      case "Account Setting":
        return <PersonIcon fontSize="small" />;
      case "Privacy Setting":
        return <AdminPanelSettingsIcon fontSize="small" />;
      case "App Setting":
        return <PaletteIcon fontSize="small" />;
      case "Security":
        return <SecurityIcon fontSize="small" />;
      case "Accuont Management":
        return <DeleteIcon fontSize="small" />;
      default:
        return <SettingsIcon fontSize="small" />;
    }
  };

  const settingsData = [
    {
      title: 'Account Setting',
      icon: 'fa-user-gear',
      items: [
        { name: 'Edit Profile', url: '/edit-profile' },
        { name: 'Change Email', url: '/change-email' },
        { name: 'Change Password', url: '/change-password' },
        { name: 'Change Phone Number', url: 'change-phone-number' },
        { name: 'Block User',url : '/block-user'}
      ],
    },
    {
      title: 'Privacy Setting',
      icon: 'fa-user-shield',
      items: [
        { name: 'Who can see my posts', url: "/default-audience" },
        // { name: 'Phone number & Birthday', url: "/personal-info" }
      ],
    },
    {
      title: 'App Setting',
      icon: 'fa-palette',
      items: [
        {
          name: 'Appearance', item: <ThemeToggle />
        },
      ],
    },
    {
      title: 'Security',
      icon: 'fa-shield-halved',
      items: [
        { name: 'Two-factor authentication', url: '/toggle-2fa' },
        { name: 'Account health', url: '/account-health' },
        { name: 'Login activity', url: '/login-activity' }
      ],
    },
    {
      title: 'Account Management',
      icon: 'fa-shield-halved',
      items: [
        { name: 'Delete Account', url: '/delete-account' },
        { name: 'Deactivate Account', url: '/deactivate-account' },
        { name: 'Logout from all devices', url: '/logout-from-all-devices' },
        { name: 'Logout', action: () => setLogoutPopupOpen(true) },
      ],
    }
  ];

  // Render settings sidebar
  return (
    <div className="setting-page-wrapper">
      <header className="setting-container">
        <div className="page-header">
          <button
            className="back-button"
            onClick={() => {
              router.back();
            }}
          >
            <ArrowBackIosIcon fontSize="small" />
          </button>
          <span className="page-name">
            Settings
          </span>
        </div>
      </header>

      <div className="setting-content">
        {settingsData.map((section, index) => (
          <section key={index} className={`setting-section ${section.title === 'Account Management' ? "setting-danger" : ""}`}>
            <div className="section-header">
              {/* Icon moved BEFORE the title */}
              <span className="section-icon">
                {getSectionIcon(section.title)}
              </span>
              <h3 className="section-title">{section.title}</h3>
            </div>

            <div className="setting-card">
              <ul className="setting-list">
                {section.items.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <li
                      className="setting-item"
                      // onClick={() => handleMenuItemClick(item.name)}
                      onClick={() => {
                        if (item.url) router.push(item.url);
                        else if (item.action) item?.action();
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Icon before the text - NO background */}
                      <span className="menu-item-icon">
                        {getMenuItemIcon(item.name)}
                      </span>


                      {/* Text */}
                      <span className="menu-item-text">{item.name}</span>

                      {/* Chevron icon on the right */}
                      {item.url &&
                        <ChevronRightIcon className="chevron-icon" fontSize="small" />
                      }

                      {item.item ? item.item : <></>}

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

      <Popup isOpen={logoutPopupOpen} onClose={() => setLogoutPopupOpen(false)} title="Logout" footer={
        <div className='popup-actions'>
          <Button variant='text' color="danger" className="popup-btn popup-btn-danger" onClick={logout}>
            Yes, Logout
          </Button>
          <Button className='popup-btn popup-btn-cancel' onClick={() => { setLogoutPopupOpen(false) }}>
            No, Go back
          </Button>
        </div>
      }>
        Are you sure to logout from this account?
      </Popup>
    </div>
  );
};

export default SettingSidebar;