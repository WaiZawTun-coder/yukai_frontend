"use client";

import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
// home icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

// friend icons
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

// save icons
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";

// setting icons
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

// premium icons
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuList = [
  {
    id: 1,
    name: "Home",
    icon: <HomeOutlinedIcon />,
    activeIcon: <HomeRoundedIcon />,
    link: "/",
  },
  {
    id: 2,
    name: "Friends",
    icon: <PeopleAltOutlinedIcon />,
    activeIcon: <PeopleAltRoundedIcon />,
    link: "/friends",
  },
  {
    id: 3,
    name: "Saves",
    icon: <BookmarkBorderOutlinedIcon />,
    activeIcon: <BookmarkRoundedIcon />,
    link: "/saves",
  },
  {
    id: 4,
    name: "Settings",
    icon: <SettingsOutlinedIcon />,
    activeIcon: <SettingsRoundedIcon />,
    link: "/settings",
  },
  {
    id: 5,
    name: "Premium",
    icon: <WorkspacePremiumOutlinedIcon />,
    activeIcon: <WorkspacePremiumRoundedIcon />,
    link: "/premium",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { loading, user } = useAuth();

  if (!loading)
    return (
      <div className="sidebar">
        <div className="logo">
          <small>yukai</small>
          <span>愉快</span>
        </div>

        <Link href="/profile/me">
          <div className="profile">
            <Image
              src={
                user.profileImage ??
                `/Images/default-profiles/${user.gender}.jpg`
              }
              alt="profile"
              width={48}
              height={48}
            />
            {/* <div className="edit">
            <BorderColorRoundedIcon />
          </div> */}
            <div className="info">
              <h4>{user.display_username}</h4>
              <p>@{user.username}</p>
              {user.profileImage}
              {/* <div className="stats">
            <span>
              <b>67</b>
              <br></br>follower
            </span>
            <span>
              <b>300</b>
              <br></br>following
            </span>
            <span>
              <b>21</b>
              <br></br>posts
            </span>
          </div> */}
            </div>
          </div>
        </Link>

        <hr className="profile-horizontal-bar" />

        <div className="menu">
          {menuList.map((menu) => (
            <Link
              href={menu.link ?? "/"}
              key={menu.id}
              className={menu.link == pathname && `active`}
            >
              {menu.link == pathname ? menu.activeIcon : menu.icon}
              <span>{menu.name}</span>
            </Link>
          ))}
        </div>

        {/* <ul className="menu">
        <li className="active">
          <HomeRoundedIcon />
          Home
        </li>
        <li>
          <PeopleAltRoundedIcon />
          Friends
        </li>
        <li>
          <BookmarkRoundedIcon />
          Saves
        </li>
        <li>
          <SettingsRoundedIcon />
          Settings
        </li>
        <li>
          <WorkspacePremiumRoundedIcon />
          Premium
        </li>
      </ul> */}

        <div className="toggle">
          <DarkModeRoundedIcon />
        </div>
      </div>
    );
};
export default Sidebar;
