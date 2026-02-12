"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AuthLoadingScreen from "@/components/ui/Loading";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfileSettings() {
    const { user: authUser, updateUser } = useAuth();
    const { showSnackbar } = useSnackbar();
    const apiFetch = useApi();
    const router = useRouter();

    const [profileData, setProfileData] = useState({
        name: "",
        username: "",
        bio: "",
        profileImage: null,
        coverImage: null,
        phoneNumber: "",
        email: ""
    });

    const [originalData, setOriginalData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null)

    // Fetch user data from backend on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsFetching(true);
                // Fetch user data - adjust endpoint as needed
                const res = await apiFetch(`/api/get-user?user_id=${authUser?.user_id}`);

                if (res.status && res.data) {
                    const userData = {
                        name: res.data.display_name || "",
                        username: res.data.username || "",
                        bio: res.data.bio || "",
                        profileImage: res.data.profile_image || null,
                        coverImage: res.data.cover_image || null,
                        // phoneNumber: res.data.phone_number || "",
                        email: res.data.email || "",
                        gender: res.data.gender || ""
                    };

                    setProfileData(userData);
                    setOriginalData(userData);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                showSnackbar({
                    title: "Error",
                    message: "Failed to load user data",
                    variant: "error",
                });
            } finally {
                setIsFetching(false);
            }
        };

        if (authUser?.user_id) {
            fetchUserData();
        }
    }, [authUser?.user_id, apiFetch, showSnackbar]);

    useEffect(() => {
        // Check if there are changes
        setHasChanges(JSON.stringify(profileData) !== JSON.stringify(originalData));
    }, [profileData, originalData]);

    const handleInputChange = (field, value) => {
        setProfileData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePhotoUpload = (type) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) {
                const previewUrl = URL.createObjectURL(file);

                if (type === "profile") {
                    setProfileData(prev => ({
                        ...prev,
                        profileImage: previewUrl,
                        profileImageFile: file   // store file separately
                    }));
                    setProfileImageFile(file);
                } else {
                    setProfileData(prev => ({
                        ...prev,
                        coverImage: previewUrl,
                        coverImageFile: file
                    }));
                    setCoverImageFile(file);
                }
            }
        };
        input.click();
    };


    const handlePhotoDelete = (type) => {
        if (type === 'profile') {
            setProfileData(prev => ({ ...prev, profileImage: null }));
        } else if (type === 'cover') {
            setProfileData(prev => ({ ...prev, coverImage: null }));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);

        try {
            const updateData = new FormData();
            updateData.append("user_id", authUser?.user_id);

            if (profileData.name !== originalData.name) {
                updateData.append("display_name", profileData.name);
            }

            if (profileData.bio !== originalData.bio) {
                updateData.append("bio", profileData.bio);
            }

            if (profileImageFile) {
                updateData.append("profile_image", profileImageFile);
            }

            if (coverImageFile) {
                updateData.append("cover_image", coverImageFile);
            }

            // correct check
            if ([...updateData.keys()].length <= 1) {
                showSnackbar({
                    title: "Info",
                    message: "No changes to save",
                    variant: "info",
                });
                return;
            }

            const res = await apiFetch("/api/edit-user", {
                method: "POST",
                body: updateData,
            });

            if (res.status) {
                setOriginalData({ ...profileData });
                setHasChanges(false);

                showSnackbar({
                    title: "Success!",
                    message: "Profile updated successfully",
                    variant: "success",
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleCancel = () => {
        setProfileData({ ...originalData });
        setHasChanges(false);
    };

    const getInitials = () => {
        if (!profileData.name) return "U";
        const names = profileData.name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return profileData.name.slice(0, 2).toUpperCase();
    };

    if (isFetching) {
        return <AuthLoadingScreen text="Loading profile data..." />
    }

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-wrapper">
                <div className="page-header">
                    <button onClick={() => { router.back() }} className="back-button">
                        <ArrowBackIosIcon fontSize="small" />
                    </button>


                    <span className="page-name">
                        Edit Profile
                    </span>
                </div>

                <div className="profile-card">
                    <div className="card-header">
                        <h2 className="card-title">Profile Information</h2>
                    </div>

                    <div className="card-content">
                        {/* Cover Image Section */}
                        <div className="cover-photo-section">
                            <div className="cover-container">
                                {profileData.coverImage ? (
                                    <Image
                                        src={profileData.coverImage?.startsWith("blob:")
                                            ? profileData.coverImage : `/api/images?url=${profileData.coverImage}`}
                                        alt="Cover"
                                        className="cover-image"
                                        width={600}
                                        height={200}
                                    />
                                ) : (
                                    <div className="cover-fallback"></div>
                                )}
                            </div>
                            <div className="cover-buttons">
                                <button
                                    className="photo-button primary"
                                    onClick={() => handlePhotoUpload('cover')}
                                >
                                    <AutorenewOutlinedIcon />
                                </button>
                                {profileData.coverImage && (
                                    <button
                                        className="photo-button delete"
                                        onClick={() => handlePhotoDelete('cover')}
                                    >
                                        <DeleteOutlinedIcon />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Profile Photo Section */}
                        <div className="profile-photo-section">
                            <div className="avatar-container">
                                <div className="avatar">
                                    <Image
                                        src={
                                            profileData.profileImage
                                                ? profileData.profileImage.startsWith("blob:")
                                                    ? profileData.profileImage
                                                    : `/api/images?url=${profileData.profileImage}`
                                                : `/Images/default-profiles/${profileData.gender ?? "male"}.jpg`
                                        }
                                        alt={profileData.name}
                                        className="avatar-image"
                                        width={64}
                                        height={64}
                                    />

                                </div>
                            </div>

                            <div className="photo-buttons">
                                <button
                                    className="photo-button primary"
                                    onClick={() => handlePhotoUpload('profile')}
                                >
                                    <AutorenewOutlinedIcon />
                                    {profileData.profileImage ? "Change Photo" : "Upload Photo"}
                                </button>

                                {profileData.profileImage && (
                                    <button
                                        className="photo-button delete"
                                        onClick={() => handlePhotoDelete('profile')}
                                    >
                                        <DeleteOutlinedIcon />
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
                                Display Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={profileData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Enter your display name"
                                className="form-input"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Username Field - Read Only */}
                        <div className="form-field">
                            <label htmlFor="username" className="form-label">
                                Username
                            </label>
                            <div className="input-with-prefix">
                                <span className="input-prefix">@</span>
                                <input
                                    type="text"
                                    id="username"
                                    value={profileData.username}
                                    readOnly
                                    className="form-input with-prefix readonly"
                                />
                            </div>
                            <p className="input-hint">
                                Username cannot be changed
                            </p>
                        </div>

                        {/* Email Field */}
                        {/* <div className="form-field">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={profileData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                className="form-input"
                disabled={isLoading}
              />
            </div> */}

                        {/* Phone Number Field */}
                        {/* <div className="form-field">
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={profileData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="Enter your phone number"
                className="form-input"
                disabled={isLoading}
              />
            </div> */}

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
                                rows={4}
                                maxLength={250}
                                className="form-textarea"
                                disabled={isLoading}
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
                        disabled={!hasChanges || isLoading}
                    >
                        <i className="fas fa-times"></i>
                        {isLoading ? "Cancelling..." : "Cancel"}
                    </button>
                    <button
                        className="edit-button save"
                        onClick={handleSave}
                        disabled={!hasChanges || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                Save Changes
                            </>
                        )}
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
                        <div className="preview-cover">
                            {profileData.coverImage ? (
                                <Image
                                    src={profileData.coverImage?.startsWith("blob:")
                                        ? profileData.coverImage : `/api/images?url=${profileData.coverImage}`}
                                    alt="Cover"
                                    className="preview-cover-image"
                                    width={300}
                                    height={200}
                                />
                            ) : (
                                <div className="preview-cover-fallback"></div>
                            )}
                        </div>
                        <div className="preview-avatar-container">
                            <div className="preview-avatar">
                                <Image
                                    src={
                                        profileData.profileImage
                                            ? profileData.profileImage.startsWith("blob:")
                                                ? profileData.profileImage
                                                : `/api/images?url=${profileData.profileImage}`
                                            : `/Images/default-profiles/${profileData.gender ?? "male"}.jpg`
                                    }
                                    alt={profileData.name}
                                    className="preview-avatar-image"
                                    width={62}
                                    height={62}
                                />
                            </div>
                        </div>
                        <div className="preview-details">
                            <h3 className="preview-name">{profileData.name || "Your Name"}</h3>
                            <p className="preview-username">@{profileData.username || "username"}</p>
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