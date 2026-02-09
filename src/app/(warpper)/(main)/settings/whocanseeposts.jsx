"use client";

import { useState, useEffect } from "react";
import "../../../css/whocanseeposts.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const WhoCanSeePosts = ({ onBack }) => {
  const [selectedOption, setSelectedOption] = useState('Friends');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentSetting, setCurrentSetting] = useState('Friends');

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

  // Load saved setting on component mount
  useEffect(() => {
    const savedSetting = localStorage.getItem('postVisibility') || 'Friends';
    setSelectedOption(savedSetting);
    setCurrentSetting(savedSetting);
  }, []);

  const handleOptionSelect = (option) => {
    if (isLoading) return;
    setSelectedOption(option);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedOption === currentSetting) {
      return; // No change
    }

    setIsLoading(true);
    setSaveSuccess(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Save to localStorage
      localStorage.setItem('postVisibility', selectedOption);
      setCurrentSetting(selectedOption);
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error saving privacy setting:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="page-title">Who Can See My Posts</h1>
            <p className="page-subtitle">
              Control who can view your posts. This setting applies to all your future posts.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="privacy-form-container">
          <form onSubmit={handleSubmit} className="privacy-form">
            {/* Current Setting Section */}
            <div className="form-section current-setting-section">
              <h3 className="section-title">
                
                Current Visibility Setting
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
                    <p className="setting-label">Your posts are currently visible to</p>
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
                
                Select Visibility Level
              </h3>

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
                        <span className="privacy-option-username">{option.note}</span>
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

            

            {/* Form Actions */}
            <div className="form-actions">
              {saveSuccess && (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i>
                  Privacy setting saved successfully!
                </div>
              )}

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
                    Save Privacy Setting
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

export default WhoCanSeePosts;