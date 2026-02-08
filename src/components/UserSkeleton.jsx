const UserSkeleton = ({ count = 6 }) => {
  return (
    <div className="user-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="user-skeleton skeleton">
          {/* Desktop layout will use flex: row; Mobile uses column */}
          <div className="top-row">
            <div className="avatar skeleton"></div>

            <div className="info">
              <div className="displayName skeleton"></div>
              <div className="username skeleton"></div>
            </div>

            <div className="action-btn skeleton"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSkeleton;
