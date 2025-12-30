const Profile = () => {
  return (
    <div className="profile-page">
      <header className="top-bar">
        <div className="logo">
          yukai <span>愉快</span>
        </div>
        <div className="search-wrapper">
          <input type="text" className="search-box" placeholder="Search" />
          <span className="search-icon">&#x1F50D;</span>
        </div>
      </header>

      <div className="profile-card">
        <img src="./Images/background.jpg" alt="cover" className="cover-img" />

        <div className="profile-info">
          <img src="./Images/profile.jpg" alt="avatar" className="avatar" />

          <div className="user-info">
            <h2>Silva</h2>
            <p className="username">@reallygreatsite</p>
            <p className="bio">Health and music &lt;3</p>

            <hr className="divider" />

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
        <span className="active">Posts</span>
        <span>Saved</span>
        <span>Tagged</span>
      </div>

      <div className="post-grid">
        <div className="post"><img src="./Images/image1.jpg" /></div>
        <div className="post"><img src="./Images/image2.jpg" /></div>
        <div className="post"><img src="./Images/image3.jpg" /></div>
        <div className="post"><img src="./Images/image4.jpg" /></div>
      </div>
    </div>
  );
};

export default Profile;