const Profile = () => {
  return (
    <div className="profile-page">
      <header className="top-bar">
        <div className="logo">
          yukai <span>愉快</span>
        </div>

            <div className="search-wrapper">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>

        <input
          type="text"
          className="search-box"
          placeholder="Search"
        />
      </div>


      </header>

      <div className="profile-card">
        <img
          src="./Images/background.jpg"
          alt="cover"
          className="cover-img"
        />

        <div className="profile-info">
          <img
            src="./Images/profile.jpg"
            alt="avatar"
            className="avatar"
          />

          <div className="user-info">
            <h2>Silva</h2>
            <p className="username">@reallygreatsite</p>
            <p className="bio">Health and music &lt;3</p>

          <div className="profile-divider"></div>


            <div className="extra-info">
              <p className="status">Single ♥️</p>
              <p className="see-info">••• See your info</p>
              <p className="text-posts">Text posts</p>
            </div>
          </div>

          <div className="stats">
            <div>
              <h3>67</h3>
              <span>followers</span>
            </div>
            <div>
              <h3>300</h3>
              <span>following</span>
            </div>
            <div>
              <h3>21</h3>
              <span>posts</span>
            </div>
          </div>

          <div className="actions">
            <button className="btn light">Edit Profile</button>
            <button className="btn">Upgrade profile</button>
          </div>
        </div>
      </div>

      <div className="tabs">
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
