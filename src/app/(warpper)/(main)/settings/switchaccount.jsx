'use client';

import { useState } from "react";
import "../../../css/switch-account.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";


const SwitchAccount = ({ onBack }) => {
  // Mock accounts - in a real app, this would come from your backend
  const [accounts] = useState([
    {
      id: 1,
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      profileImage: "https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAyNzUyODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      isActive: true
    },
    {
      id: 2,
      name: "Sarah Smith",
      username: "sarahsmith",
      email: "sarah@example.com",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      isActive: false
    },
    {
      id: 3,
      name: "Mike Johnson",
      username: "mikej",
      email: "mike@example.com",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      isActive: false
    },
    {
      id: 4,
      name: "Emma Wilson",
      username: "emmaw",
      email: "emma@example.com",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w-400",
      isActive: false
    }
  ]);

  const [currentAccountId, setCurrentAccountId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const handleAccountSelect = (accountId) => {
    setSelectedAccountId(accountId);
    setPasswordError("");
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (passwordError) setPasswordError("");
  };

  const validateForm = () => {
    if (!selectedAccountId) {
      return "Please select an account to switch to";
    }
    
    if (!password) {
      setPasswordError("Password is required");
      return "Password is required";
    }
    
    return null;
  };

  const handleSwitchAccount = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for verification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Find the selected account
      const account = accounts.find(acc => acc.id === selectedAccountId);
      
      if (account) {
        // ============================================
        // TODO: REPLACE WITH YOUR ACCOUNT SWITCHING LOGIC
        // ============================================
        // Call your backend to switch accounts
        // switchAccountApi(selectedAccountId, password);
        
        setCurrentAccountId(selectedAccountId);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <span>Successfully switched to ${account.name}'s account!</span>
        `;
        document.querySelector('.form-actions').prepend(successMessage);
        
        // Remove message after 3 seconds and go back
        setTimeout(() => {
          successMessage.remove();
          if (onBack) {
            setTimeout(() => onBack(), 500);
          }
        }, 3000);
        
        // Reset form
        setPassword("");
        setSelectedAccountId(null);
      }
    } catch (error) {
      console.error("Error switching account:", error);
      setPasswordError("Invalid password. Please try again.");
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>Failed to switch account. Please check your password.</span>
      `;
      document.querySelector('.form-actions').prepend(errorMessage);
      
      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out from all accounts?")) {
      setIsLoading(true);
      
      try {
        // ============================================
        // TODO: REPLACE WITH YOUR LOGOUT LOGIC
        // ============================================
        // Call your logout function
        // logoutAllAccountsApi();
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <span>Successfully logged out from all accounts!</span>
        `;
        document.querySelector('.form-actions').prepend(successMessage);
        
        setTimeout(() => {
          successMessage.remove();
          if (onBack) {
            setTimeout(() => onBack(), 500);
          }
        }, 3000);
      } catch (error) {
        console.error("Error logging out:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getInitials = (name) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="switch-account-page">
      <div className="switch-account-container">
        {/* Header with Back Button */}
        <div className="switch-account-header">
          {onBack && (
            <button
              onClick={onBack}
              className="back-button"
              disabled={isLoading}
            >
              <ArrowBackIosIcon fontSize="small" />
            </button>
          )}

          <div className="header-content">
            <h1 className="page-title">Switch Account</h1>
            <p className="page-subtitle">
              Choose an account to switch to or manage your accounts
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="account-form-container">
          <form onSubmit={handleSwitchAccount} className="account-form">
            {/* Current Account Section */}
            <div className="form-section current-account-section">
              <h3 className="section-title">
                {/* <i className="fas fa-user-circle section-icon"></i> */}
                Current Active Account
              </h3>
              <div className="current-account-display">
                {accounts
                  .filter(account => account.id === currentAccountId)
                  .map(account => (
                    <div key={account.id} className="account-info active">
                      <div className="account-icon">
                        {account.profileImage ? (
                          <img 
                            src={account.profileImage} 
                            alt={account.name} 
                            className="account-avatar"
                          />
                        ) : (
                          <div className="account-avatar-initials">
                            {getInitials(account.name)}
                          </div>
                        )}
                      </div>
                      <div className="account-details">
                        <p className="account-label">Currently logged in as</p>
                        <p className="account-name">{account.name}</p>
                        <p className="account-username">@{account.username}</p>
                        <p className="account-email">{account.email}</p>
                      </div>
                      <div className="active-badge">
                        <i className="fas fa-check-circle"></i>
                        <span>Active</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Available Accounts Section */}
            <div className="form-section accounts-section">
              <h3 className="section-title">
                {/* <i className="fas fa-users section-icon"></i> */}
                Switch To Another Account
              </h3>
              
              <div className="accounts-list">
                {accounts
                  .filter(account => account.id !== currentAccountId)
                  .map(account => (
                    <div 
                      key={account.id}
                      className={`account-item ${selectedAccountId === account.id ? 'selected' : ''}`}
                      onClick={() => handleAccountSelect(account.id)}
                    >
                      <div className="account-item-content">
                        <div className="account-item-icon">
                          {account.profileImage ? (
                            <img 
                              src={account.profileImage} 
                              alt={account.name} 
                              className="account-item-avatar"
                            />
                          ) : (
                            <div className="account-item-avatar-initials">
                              {getInitials(account.name)}
                            </div>
                          )}
                        </div>
                        <div className="account-item-details">
                          <p className="account-item-name">{account.name}</p>
                          <p className="account-item-username">@{account.username}</p>
                          <p className="account-item-email">{account.email}</p>
                        </div>
                        <div className="account-item-action">
                          <i className="fas fa-chevron-right"></i>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Verify Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter your password to verify"
                  className={`form-input ${passwordError ? 'error' : ''}`}
                  disabled={isLoading || !selectedAccountId}
                />
                {passwordError && (
                  <p className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {passwordError}
                  </p>
                )}
                <p className="form-hint">
                  Enter your password to verify your identity and switch accounts
                </p>
              </div>
            </div>

            

            

            {/* Form Actions */}
            <div className="form-actions">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="action-button cancel-button"
                  disabled={isLoading}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                className="action-button switch-button"
                disabled={isLoading || !selectedAccountId || !password}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Switching...
                  </>
                ) : (
                  <>
                    <i className="fas fa-random"></i>
                    Switch Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      </div>
  );
};

export default SwitchAccount;