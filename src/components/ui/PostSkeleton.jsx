"use client";

export default function PostSkeleton() {
  return (
    <div className="skeleton-post-card skeleton-container">
      {/* Header */}
      <div className="skeleton-post-header">
        <div className="skeleton-avatar skeleton-box"></div>

        <div className="skeleton-user-info">
          <div className="skeleton-line skeleton-short"></div>
          <div className="skeleton-line skeleton-tiny"></div>
        </div>

        <div className="skeleton-menu skeleton-box"></div>
      </div>

      {/* Divider */}
      <div className="skeleton-divider"></div>

      {/* Content text */}
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-full"></div>
        <div className="skeleton-line skeleton-medium"></div>
      </div>

      {/* Image */}
      <div className="skeleton-image skeleton-box"></div>

      {/* Actions */}
      <div className="skeleton-actions">
        <div className="action skeleton-box"></div>
        <div className="action skeleton-box"></div>
        <div className="action skeleton-box"></div>
      </div>
    </div>
  );
}
