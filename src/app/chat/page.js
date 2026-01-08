import '../css/chat.css';

const Chat = () => {
  const users = [
    { id: 1, name: 'Bernie', status: 'online', special: false, avatar: 'https://i.pravatar.cc/100?img=1',},
    { id: 2, name: 'David', status: 'away', special: false, avatar: 'https://i.pravatar.cc/100?img=2',},
    { id: 3, name: 'SIANNA', status: 'online', special: true, avatar: 'https://i.pravatar.cc/100?img=3',},
    { id: 4, name: 'ILLY', status: 'away', special: false, avatar: 'https://i.pravatar.cc/100?img=4',},
    { id: 5, name: 'JamesJJ', status: 'online', special: false, avatar: 'https:/i.pravatar.cc/100?img=5',},
  ];

  return (
    <div className="main-wrapper">
    <div className="container">
      
      <div className="header-icons">
        <i className="fa-solid fa-bell"></i>
        <i className="fa-solid fa-comment-dots"></i>
        <i className="fa-solid fa-circle-info"></i>
      </div>

      
      <div className="premium-card">
        <div className="premium-header">
          <span className="card-title">Explore Premium</span>
          <i className="fa-solid fa-crown crown-icon"></i>
        </div>

        <div className="card-body">
          <p className="sub-text">
            Effect and colors to make your display name stand out!
          </p>
          <button className="check-btn">check it out!</button>
        </div>
      </div>
        
      <div className="friend-header"><span className="count-text">Friend • 21 online</span>
        <div className="tabs"><span className="tab active">All</span>
            <span className="tab">Online</span>
        </div>
      </div>  
      
      <div className="user-list">
        {users.map(user => (
          <div
            key={user.id}
            className={`user-item ${user.special ? 'special-bg' : ''}`}
          >
            <div className="user-info">
              <div className="avatar-wrapper">
                <div className="avatar">
                  <img src={user.avatar} alt={user.name}/>
                </div>
                <div className={`status-dot ${user.status}`}></div>
              </div>
              <span className="user-name">{user.name}</span>
            </div>

            <div className="user-actions">
              <i className="fa-solid fa-comment-dots"></i>
              <i className="fa-solid fa-ellipsis"></i>
              
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Chat;
