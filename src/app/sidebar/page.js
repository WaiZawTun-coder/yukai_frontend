import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';



const Sidebar = () => {
    return(
<div className="sidebar">
  <div className="logo">
    <small>yukai</small>
    <span>愉快</span>
  </div>

  <div className="profile">
    <img src="/Images/loginphoto2.jpg" alt="profile" />
    <div className="edit"><BorderColorRoundedIcon/></div>
    <div className="info">
      <h4>Silva</h4>
      <p>@growwithsilva</p>
      <div class="stats">
        <span><b>67</b><br></br>follower</span>
        <span><b>300</b><br></br>following</span>
        <span><b>21</b><br></br>posts</span>
      </div>
    </div>
  </div>

  <ul className="menu">
    <li className="active"><HomeRoundedIcon/>Home</li>
    <li><PeopleAltRoundedIcon/>Friends</li>
    <li><BookmarkRoundedIcon/>Saves</li>
    <li><SettingsRoundedIcon/>Settings</li>
    <li><WorkspacePremiumRoundedIcon/>Premium</li>
  </ul>

  <div className="toggle">
    <DarkModeRoundedIcon/>
  </div>
</div>

            
    );
}
export default Sidebar;