
import React from 'react';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorder";
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';



const SocialPost = () => {
  return (
    <div className="main-wrapper">
      <div className="post-container">
        
        {/* Left Side: Image */}
        <div className="image-section">
          <div className="post-header"> 
          <img src="./Images/Eunsoo.jpg" style={{ width: '45px', height: '45px' , borderRadius:'50%' }} className="avatar" alt="User" />
          <div>
            <span className="username-brand">Thea</span><br />
            <span style={{ color: '#94a3b8', fontSize: '16px',fontWeight:'bolder' }}>@Theababy2</span>
            <button className="follow-btn">follow</button>
          </div>
          </div>
          <div className="image-overlay">
          <img 
            src="./Images/sky.jpg" 
            alt="Landscape" 
          /> 
          </div>
        </div>

        {/* Right Side: Content */}
        
        <div className="sidebar-section">

        
          <div className="sidebar-header">
            <h3>Isn't beautiful</h3>
          </div>
          <div className="line"></div>
          <div className="comments-list">
            <div className="comment-item">
              <div className="comment-user-info">
                <img src="./Images/jess.jpg" className="avatar" style={{ width: '32px', height: '32px' }} alt="jess" />
                <div>
                  <span className="comment-name">Jess</span><br />
                  <span className="comment-text">wowwww</span><br />
                </div>
              </div>
              <div className="comment-actions">
                <span style={{ fontSize: '13px', cursor: 'pointer' }}>reply</span>
                <FavoriteBorderRoundedIcon />
              </div>
            </div>  

            <div className="comment-item">
              <div className="comment-user-info">
                <img src="./Images/cutevickey.jpg" className="avatar" style={{ width: '32px', height: '32px' }} alt="vickey" />
                <div>
                  <span className="comment-name">Vickey</span><br />
                  <span className="comment-text">So pretty</span>
                </div>
              </div>
              <div className="comment-actions">
                <span style={{ fontSize: '13px', cursor: 'pointer' }}>reply</span>
                <FavoriteBorderRoundedIcon />
              </div>
            </div>
          </div>

          <div className="footer-section">
            <div className="stats-bar">
              <span><FavoriteBorderIcon />200 likes</span>
              <span><CommentRoundedIcon /> 2 comment</span>
              <span><ShareRoundedIcon /> 8 shares</span>
              <span><BookmarkBorderRoundedIcon /> 10 saves</span>
            </div>
            
            <div className="comment-input-row">
              <img 
                src="./Images/Olsena.jpg" 
                className="input-avatar-outside" 
                alt="Me" 
              />
              <div className="input-wrapper">
                <input type="text" placeholder="Write comment" />
              </div>
            </div>
          </div>
        </div>
        <div className="more-icon"><MoreHorizRoundedIcon /></div>
      </div>
    </div>
  );
};

export default SocialPost;