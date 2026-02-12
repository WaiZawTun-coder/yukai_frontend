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

// notification icons
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";

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
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const menuList = [
  {
    id: 1,
    name: "Home",
    icon: HomeOutlinedIcon,
    activeIcon: HomeRoundedIcon,
    link: "/",
  },
  {
    id: 2,
    name: "Friends",
    icon: PeopleAltOutlinedIcon,
    activeIcon: PeopleAltRoundedIcon,
    link: "/friends",
  },
  {
    id: 3,
    name: "Notifications",
    icon: NotificationsActiveOutlinedIcon,
    activeIcon: NotificationsActiveIcon,
    link: "/notifications",
  },
  {
    id: 4,
    name: "Settings",
    icon: SettingsOutlinedIcon,
    activeIcon: SettingsRoundedIcon,
    link: "/settings",
  },
  // {
  //   id: 5,
  //   name: "Premium",
  //   icon: WorkspacePremiumOutlinedIcon,
  //   activeIcon: WorkspacePremiumRoundedIcon,
  //   link: "/premium",
  // },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { loading, user } = useAuth();

  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // ignore tiny scrolls
      if (Math.abs(currentY - lastScrollY) < 10) return;

      if (currentY > lastScrollY && currentY > 10) {
        // scrolling down
        setHidden(true);
      } else {
        // scrolling up
        setHidden(false);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (loading) return null;

  return (
    <div className={`sidebar ${hidden ? "sidebar--hidden" : ""}`}>
      <div className="logo">
        <small>yukai</small>
        <span>愉快</span>
      </div>

      <Link href={`/${user.username}`}>
        <div className="profile">
          <Image
            src={
              user.profile_image
                ? `/api/images?url=${user.profile_image}`
                : `/Images/default-profiles/${user.gender}.jpg`
            }
            alt="profile"
            width={48}
            height={48}
          />
          <div className="info">
            <h4>{user.display_name}</h4>
            <p>@{user.username}</p>
            {user.profileImage}
          </div>
        </div>
      </Link>

      <hr className="profile-horizontal-bar" />

      <div className="menu">
        {menuList.map((menu) => {
          const isActive = pathname === menu.link;
          const Icon = isActive ? menu.activeIcon : menu.icon;

          return (
            <Link
              href={menu.link}
              key={menu.id}
              className={`menu-item ${isActive ? "active" : ""}`}
            >
              <Icon />
              <span>{menu.name}</span>
            </Link>
          );
        })}
      </div>

        {pathname !== "/settings" && 
      <div className="toggle">
        {/* <DarkModeRoundedIcon /> */}
        <ThemeToggle />
      </div>}
    </div>
  );
};
export default Sidebar;
