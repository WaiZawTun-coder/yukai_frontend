"use client";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useRouter } from "next/navigation";

export default function ProfileSkeleton() {
  const router = useRouter();

  return (
    <div className="profile-skeleton-wrapper">
      <div className="page-header">
        <button
          className="back-button"
          onClick={() => {
            router.back();
          }}
        >
          <ArrowBackIosIcon />
        </button>
      </div>
      <div className="profile-card skeleton">
        {/* Cover */}
        <div className="sk-cover shimmer" />

        {/* Avatar */}
        <div className="shimmer sk-avatar" />

        {/* Name + username */}
        <div className="sk-text name shimmer" />
        <div className="sk-text username shimmer" />

        {/* Bio */}
        <div className="sk-text bio shimmer" />

        {/* Stats */}
        <div className="sk-stats">
          <div className="sk-stat shimmer" />
          <div className="sk-stat shimmer" />
          <div className="sk-stat shimmer" />
        </div>

        {/* Buttons */}
        <div className="sk-buttons">
          <div className="sk-btn shimmer" />
          <div className="sk-btn shimmer" />
        </div>

        {/* Divider */}
        <div className="sk-divider shimmer" />

        {/* Info line */}
        <div className="sk-text small shimmer" />
      </div>

      {/* Tabs */}
      <div className="sk-tabs">
        <div className="sk-tab shimmer" />
        <div className="sk-tab shimmer active" />
        <div className="sk-tab shimmer" />
        <div className="sk-tab shimmer" />
      </div>

      {/* Posts Grid */}
      <div className="sk-post-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="sk-post shimmer" />
        ))}
      </div>
    </div>
  );
}
