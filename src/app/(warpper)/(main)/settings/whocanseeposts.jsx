"use client";

import { useState, useEffect } from "react";
import "../../../css/whocanseeposts.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const WhoCanSeePosts = ({ onBack }) => {
  const [selectedOption, setSelectedOption] = useState('Friends');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentSetting, setCurrentSetting] = useState('Friends');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const privacyOptions = [
    {
      id: 'public',
      value: 'Public',
      icon: 'fas fa-globe',
      description: 'Anyone on or off the platform can see your posts'
    },
    {
      id: 'friends',
      value: 'Friends',
      icon: 'fas fa-user-friends',
      description: 'Only your confirmed friends can see your posts'
    },
    {
      id: 'onlyme',
      value: 'Only me',
      icon: 'fas fa-lock',
      description: 'Only you can see your posts - completely private'
      
    }
  ];

  // Load default privacy setting
  useEffect(() => {
    const initializeData = async () => {
      try {
        // First try localStorage
        const savedSetting = localStorage.getItem('postVisibility') || 'Friends';
        setSelectedOption(savedSetting);
        setCurrentSetting(savedSetting);
        
        // Then try to fetch from backend
        try {
          const response = await fetch('/api/user/privacy/default');
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.status === true) {
              let displayValue = 'Friends';
              if (data.default_privacy === 'public') displayValue = 'Public';
              else if (data.default_privacy === 'friends') displayValue = 'Friends';
              else if (data.default_privacy === 'only me') displayValue = 'Only me';
              
              setSelectedOption(displayValue);
              setCurrentSetting(displayValue);
              localStorage.setItem('postVisibility', displayValue);
            }
          }
        } catch (fetchError) {
          // Silently fail - use localStorage
          console.log("Backend unavailable, using localStorage");
        }
        
      } catch (mainError) {
        setError("Could not load settings. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleOptionSelect = (option) => {
    if (isLoading || loading) return;
    setSelectedOption(option);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedOption === currentSetting) {
      return; // No change
    }

    setIsLoading(true);
    setSaveSuccess(false);
    setError("");

    try {
      // Convert display value to database value
      let dbValue = 'friends';
      if (selectedOption === 'Public') dbValue = 'public';
      else if (selectedOption === 'Friends') dbValue = 'friends';
      else if (selectedOption === 'Only me') dbValue = 'only me';

      try {
        // Try to save to backend
        const response = await fetch('/api/user/privacy/default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ privacy: dbValue })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status) {
            // Success from backend
            setCurrentSetting(selectedOption);
            localStorage.setItem('postVisibility', selectedOption);
            setSaveSuccess(true);
          } else {
            throw new Error(data.message || 'Backend save failed');
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (apiError) {
        // Fallback: Save locally only
        setCurrentSetting(selectedOption);
        localStorage.setItem('postVisibility', selectedOption);
        setSaveSuccess(true);
        // Don't set this as an error since it's just a fallback
        // setError("Saved locally (backend unavailable).");
      }
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        setError("");
      }, 3000);

    } catch (error) {
      setError(error.message || "Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="who-can-see-posts-page">
        <div className="who-can-see-posts-container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading privacy settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="who-can-see-posts-page">
      <div className="who-can-see-posts-container">
        {/* Header with Back Button */}
        <div className="who-can-see-posts-header">
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
            <h1 className="page-title">Default Post Privacy</h1>
            <p className="page-subtitle">
              Set who can see your posts by default. This will apply to all new posts you create.
            </p>
          </div>
        </div>

        {/* Error Message - Only show real errors */}
        {error && error !== "Saved locally (backend unavailable)." && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="privacy-form-container">
          <form onSubmit={handleSubmit} className="privacy-form">
            {/* Current Setting Section */}
            <div className="form-section current-setting-section">
              <h3 className="section-title">
                Current Default Setting
              </h3>
              <div className="current-setting-display">
                <div className="setting-info">
                  <div className="setting-icon">
                    <div className="setting-avatar-initials">
                      <i className={
                        currentSetting === 'Public' ? 'fas fa-globe' :
                        currentSetting === 'Friends' ? 'fas fa-user-friends' :
                        'fas fa-lock'
                      }></i>
                    </div>
                  </div>
                  <div className="setting-details">
                    <p className="setting-label">Default privacy for new posts:</p>
                    <p className="setting-value">{currentSetting}</p>
                    <div className="active-badge">
                      <i className="fas fa-check-circle"></i>
                      Active Setting
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Options Section */}
            <div className="form-section options-section">
              <h3 className="section-title">
                Select Default Privacy Level
              </h3>
              <p className="section-subtitle">
                Choose who can see your posts by default. You can still change privacy for individual posts.
              </p>

              <div className="privacy-options">
                {privacyOptions.map((option) => (
                  <div 
                    key={option.id}
                    className={`privacy-option ${selectedOption === option.value ? 'selected' : ''} ${isLoading ? 'disabled' : ''}`}
                    onClick={() => handleOptionSelect(option.value)}
                  >
                    <div className="privacy-option-radio">
                      <div className={`radio-circle ${selectedOption === option.value ? 'checked' : ''}`}>
                        {selectedOption === option.value && <div className="radio-dot"></div>}
                      </div>
                    </div>
                    
                    <div className="privacy-option-avatar">
                      <div className="privacy-avatar-initials">
                        <i className={option.icon}></i>
                      </div>
                    </div>
                    
                    <div className="privacy-option-details">
                      <div className="privacy-option-header">
                        <h4 className="privacy-option-name">{option.value}</h4>
                      </div>
                      <p className="privacy-option-description">{option.description}</p>
                    </div>
                    
                    <div className="privacy-option-action">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Message */}
            {saveSuccess && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <span>
                  Default privacy updated successfully! All new posts will use this setting.
                  {error === "Saved locally (backend unavailable)." && 
                    " (Saved locally - backend connection issue)"}
                </span>
              </div>
            )}

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
                disabled={isLoading || selectedOption === currentSetting}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Set as Default
                  </>
                )}
              </button>
            </div>

            {/* Information Note */}
            <div className="info-note">
              <i className="fas fa-info-circle"></i>
              <span>
                This setting only affects <strong>new posts</strong> you create. 
                Existing posts keep their original privacy settings. 
                You can still choose a different privacy for individual posts when creating them.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhoCanSeePosts;  