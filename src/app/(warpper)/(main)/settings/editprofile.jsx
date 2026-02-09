"use client";

import { useState } from "react";
import "../../../css/edit-profile.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

export default function ProfileSettings({ onBack }) {
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    username: "johndoe",
    bio: "Software developer | Tech enthusiast | Coffee lover ☕",
    profileImage:
      "https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAyNzUyODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  });

  const [originalData, setOriginalData] = useState({ ...profileData });
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field, value) => {
    const newData = { ...profileData, [field]: value };
    setProfileData(newData);
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData));
  };

  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        const newData = { ...profileData, profileImage: imageUrl };
        setProfileData(newData);
        setHasChanges(true);
        alert("Photo uploaded successfully");
      }
    };
    input.click();
  };

  const handlePhotoDelete = () => {
    const newData = { ...profileData, profileImage: null };
    setProfileData(newData);
    setHasChanges(true);
    alert("Photo deleted");
  };

  const handleSave = () => {
    setOriginalData({ ...profileData });
    setHasChanges(false);
    alert("Profile updated successfully");
  };

  const handleCancel = () => {
    setProfileData({ ...originalData });
    setHasChanges(false);
    alert("Changes discarded");
  };

  const getInitials = () => {
    const names = profileData.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return profileData.name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-wrapper">
        {/* Back Button */}
        {onBack && (
          <button onClick={onBack} className="back-button">
             <ArrowBackIosIcon fontSize="small" />
          </button>
        )}

        <div className="profile-header">
          <h1 className="profile-title">Edit Profile</h1>
          <p className="profile-subtitle">Update your personal information</p>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">Profile Information</h2>
          </div>

          <div className="card-content">
            {/* Profile Photo Section */}
            <div className="profile-photo-section">
              <div className="avatar-container">
                <div className="avatar">
                  {profileData.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt={profileData.name}
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-fallback">{getInitials()}</div>
                  )}
                </div>
              </div>

              <div className="photo-buttons">
                <button
                  className="photo-button primary"
                  onClick={handlePhotoUpload}
                >
                  <i className="fas fa-upload"></i>
                  {profileData.profileImage ? "Change Photo" : "Upload Photo"}
                </button>

                {profileData.profileImage && (
                  <button
                    className="photo-button delete"
                    onClick={handlePhotoDelete}
                  >
                    <i className="fas fa-trash"></i>
                    Delete Photo
                  </button>
                )}
              </div>

              <p className="photo-hint">
                Recommended: Square image, at least 400x400px
              </p>
            </div>

            {/* Name Field */}
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={profileData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className="form-input"
              />
            </div>

            {/* Username Field */}
            <div className="form-field">
              <label htmlFor="username" className="form-label">
                Username <span className="required">*</span>
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">@</span>
                <input
                  type="text"
                  id="username"
                  value={profileData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="username"
                  className="form-input with-prefix"
                />
              </div>
              <p className="input-hint">
                Your unique identifier on the platform
              </p>
            </div>

            {/* Bio Field */}
            <div className="form-field">
              <label htmlFor="bio" className="form-label">
                Bio
              </label>
              <textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={5}
                maxLength={250}
                className="form-textarea"
              />
              <div className="character-count">
                <span>{profileData.bio.length}/250 characters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`edit-buttons ${hasChanges ? "visible" : "hidden"}`}>
          <button
            className="edit-button cancel"
            onClick={handleCancel}
            disabled={!hasChanges}
          >
            <i className="fas fa-times"></i>
            Cancel
          </button>
          <button
            className="edit-button save"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <i className="fas fa-save"></i>
            Save Changes
          </button>
        </div>

        {/* Preview Card */}
        <div className="preview-card">
          <div className="card-header">
            <h2 className="card-title">Profile Preview</h2>
            <p className="card-description">
              This is how your profile will appear to others
            </p>
          </div>

          <div className="preview-content">
            <div className="preview-avatar">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt={profileData.name}
                  className="preview-avatar-image"
                />
              ) : (
                <div className="preview-avatar-fallback">{getInitials()}</div>
              )}
            </div>
            <div className="preview-details">
              <h3 className="preview-name">{profileData.name}</h3>
              <p className="preview-username">@{profileData.username}</p>
              {profileData.bio && (
                <p className="preview-bio">{profileData.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
