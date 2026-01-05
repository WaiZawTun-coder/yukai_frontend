import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
const friend_list = () => {
  return (
    <div className="friends-page">
      <div className="tabs">
        <button className="active">Friends</button>
        <button>Following</button>
        <button>Friend requests</button>
        <button>Add Friend</button>
      </div>

      <div className="friends-card">

        
        <div className="friend-row">
          <div className="user">
            <img src="" alt="Bonnie" />
            <span>Bonnie</span>
          </div>
          <button className="menu-btn"><MoreHorizRoundedIcon /></button>
        </div>

        
        <div className="friend-row">
          <div className="user">
            <img src="" alt="Kevin" />
            <span>Kevin</span>
          </div>
          <button className="menu-btn"><MoreHorizRoundedIcon /></button>
        </div>

        
        <div className="friend-row">
          <div className="user">
            <img src="" alt="Elsa" />
            <span>Elsa</span>
          </div>
          <button className="menu-btn"><MoreHorizRoundedIcon /></button>
        </div>

      </div>
    </div>
  );
};

export default friend_list;
