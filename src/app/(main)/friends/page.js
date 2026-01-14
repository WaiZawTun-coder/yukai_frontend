"use client";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  { id: 1, name: "Friends", url: "?type=friends" },
  { id: 2, name: "Following", url: "?type=following" },
  { id: 3, name: "Requests", url: "?type=requests" },
  { id: 4, name: "Add More", url: "?type=add-more" },
];

const Friends = () => {
  const [activeTab, setActiveTab] = useState(1);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const type = params.get("type");

    TABS.forEach((tab) => {
      if (tab.url.split("=")[1] == type) {
        setActiveTab(tab.id);
        return;
      }
    });
  }, [params]);

  useEffect(() => {
    // fetch for each data
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab.id);
    router.replace(tab.url);
  };

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>Friends</h1>
        <p>Manage your friends, following, requests and add more friends</p>
      </div>
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${activeTab == tab.id ? "active" : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="friends-card">
        <div className="friend-row">
          <div className="user">
            <img src="" alt="Bonnie" />
            <span>Bonnie</span>
          </div>
          <button className="menu-btn">
            <MoreHorizRoundedIcon />
          </button>
        </div>

        <div className="friend-row">
          <div className="user">
            <img src="" alt="Kevin" />
            <span>Kevin</span>
          </div>
          <button className="menu-btn">
            <MoreHorizRoundedIcon />
          </button>
        </div>

        <div className="friend-row">
          <div className="user">
            <img src="" alt="Elsa" />
            <span>Elsa</span>
          </div>
          <button className="menu-btn">
            <MoreHorizRoundedIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Friends;
