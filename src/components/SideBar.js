"use client";

import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuList = [
  { id: 1, name: "Home", icon: <HomeRoundedIcon />, link: "/" },
  { id: 2, name: "Friends", icon: <PeopleAltRoundedIcon />, link: "/friends" },
  { id: 3, name: "Saves", icon: <BookmarkRoundedIcon />, link: "/saves" },
  { id: 4, name: "Settings", icon: <SettingsRoundedIcon />, link: "/settings" },
  {
    id: 5,
    name: "Premium",
    icon: <WorkspacePremiumRoundedIcon />,
    link: "/premium",
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="sidebar">
      <div className="logo">
        <small>yukai</small>
        <span>愉快</span>
      </div>

      <Link href="/profile/me">
        <div className="profile">
          <Image
            src="/Images/loginphoto2.jpg"
            alt="profile"
            width={48}
            height={48}
          />
          {/* <div className="edit">
            <BorderColorRoundedIcon />
          </div> */}
          <div className="info">
            <h4>Silva</h4>
            <p>@growwithsilva</p>
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
            {menu.icon}
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
