"use client";

import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useApi } from "@/utilities/api";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ProfileSkeleton from "@/components/ui/ProfileSkeleton";

const Profile = () => {
  const { user: authUser } = useAuth();
  const params = useParams();
  const apiFetch = useApi();
  const router = useRouter();

  const { showSnackbar } = useSnackbar();

  const username = params.username;

  const [user, setUser] = useState({});
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!username) router.replace("/");

    const getUserData = async () => {
      setIsLoading(true);
      // TODO: fetch user data with username
      try {
        const res = await apiFetch(`/api/get-user?username=${username}`);

        if (!res.status) {
          showSnackbar({
            title: "Failed to fetch user data",
            message: "Unable to get user data with username " + username,
            variant: "error",
          });
          return;
        }

        const user = res.data;
        setUser(user);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
    // TODO: fetch user post with username or userId
  }, [username, router, showSnackbar, apiFetch]);

  useEffect(() => {
    setIsLoggedInUser(username == authUser.username);
  }, [username, authUser]);

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="cover-img">
          <Image
            src={
              user.cover_image
                ? `/api/images?url=${user.cover_image}`
                : "/Images/background.jpg"
            }
            alt="cover"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="profile-info">
          <Image
            src={
              user.profile_image
                ? `/api/images?url=${user.profile_image}`
                : `/Images/default-profiles/${user.gender}.jpg`
            }
            alt={user.username ?? "avatar"}
            className="avatar"
            width={120}
            height={120}
          />

          <div className="user-info">
            <div className="info-container">
              <div>
                <h2>{user.display_name}</h2>
                <p className="username">@{username}</p>
                <p className="bio">{user.bio ?? `No bio for @${username}`}</p>
              </div>
              <div className="stats-container">
                <div className="profile-stats">
                  <div>
                    <h3>{user.follower_count}</h3>
                    <span>followers</span>
                  </div>
                  <div>
                    <h3>{user.following_count}</h3>
                    <span>following</span>
                  </div>
                  <div>
                    <h3>{user.friends_count}</h3>
                    <span>friends</span>
                  </div>
                </div>

                <div className="actions">
                  {isLoggedInUser ? (
                    <>
                      <button className="btn light">
                        <EditIcon /> Edit Profile
                      </button>
                      <button className="btn">
                        <WorkspacePremiumIcon />
                        Upgrade profile
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn light">Add friend</button>
                      <button className="btn">Message</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-divider"></div>

            <div className="extra-info">
              {/* TODO: update database schema */}
              {/* <p className="status">Single ♥️</p> */}
              <p className="see-info">••• See your info</p>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <span>Text posts</span>
        <span className="active">Posts</span>
        <span>Saved</span>
        <span>Tagged</span>
      </div>

      <div className="post-grid">
        <div className="post">
          <img src="./Images/image1.jpg" alt="" />
        </div>
        <div className="post">
          <img src="./Images/image2.jpg" alt="" />
        </div>
        <div className="post">
          <img src="./Images/image3.jpg" alt="" />
        </div>
        <div className="post">
          <img src="./Images/image4.jpg" alt="" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
