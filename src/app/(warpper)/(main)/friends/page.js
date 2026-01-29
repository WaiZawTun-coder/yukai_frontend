"use client";

import PeopleGrid from "@/components/PeopleGrid";
import { useApi } from "@/utilities/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const TABS = [
  { id: 1, name: "Friends", url: "friends" },
  { id: 2, name: "Following", url: "following" },
  { id: 3, name: "Requests", url: "requests" },
  { id: 4, name: "Add More", url: "add-more" },
];

const INITIAL_TAB_STATE = {
  list: [],
  page: 1,
  totalPages: 1,
  hasMore: true,
  loading: false,
  initialized: false,
};

export default function Friends() {
  const router = useRouter();
  const params = useSearchParams();
  const apiFetch = useApi();

  const [activeTab, setActiveTab] = useState("friends");

  const [tabData, setTabData] = useState({
    friends: { ...INITIAL_TAB_STATE },
    following: { ...INITIAL_TAB_STATE },
    requests: { ...INITIAL_TAB_STATE },
    "add-more": { ...INITIAL_TAB_STATE },
  });

  /* ---------------- URL → TAB SYNC ---------------- */
  useEffect(() => {
    const update = () => {
      const type = params.get("type");
      if (type && tabData[type]) {
        setActiveTab(type);
      }
    };
    update();
  }, [params, tabData]);

  /* ---------------- API RESOLVER ---------------- */
  const endpointForTab = (tab, page) => {
    switch (tab) {
      case "friends":
        return `/api/get-friends?page=${page}`;
      case "following":
        return `/api/get-following?page=${page}`;
      case "requests":
        return `/api/get-received-requests?page=${page}`;
      case "add-more":
        return `/api/get-people-you-may-know?page=${page}`;
      default:
        return null;
    }
  };

  /* ---------------- FETCH LOGIC ---------------- */
  const fetchTabData = useCallback(
    async (tab) => {
      const current = tabData[tab];
      if (!current || current.loading || !current.hasMore) return;
      setTabData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], loading: true },
      }));
      try {
        const res = await apiFetch(endpointForTab(tab, current.page));
        const newItems = res?.data || [];
        const totalPages = res?.total_pages || 1;
        setTabData((prev) => {
          const data = newItems.filter(
            (item) => !prev[tab].list.some((i) => i.user_id === item.user_id)
          );
          return {
            ...prev,
            [tab]: {
              ...prev[tab],
              list: [...prev[tab].list, ...data],
              page: prev[tab].page + 1,
              totalPages,
              hasMore: prev[tab].page < totalPages,
              loading: false,
              initialized: true,
            },
          };
        });
      } catch (err) {
        console.error(err);
        setTabData((prev) => ({
          ...prev,
          [tab]: { ...prev[tab], loading: false },
        }));
      }
    },
    [apiFetch, tabData]
  );
  /* ---------------- INITIAL LOAD PER TAB ---------------- */
  useEffect(() => {
    const update = () => {
      const current = tabData[activeTab];
      if (!current.initialized) {
        fetchTabData(activeTab);
      }
    };
    update();
  }, [activeTab, fetchTabData, tabData]);

  /* ---------------- TAB CLICK ---------------- */
  const handleTabChange = (tab) => {
    setActiveTab(tab.url);
    router.replace(`?type=${tab.url}`, { scroll: false });
  };

  const currentTab = tabData[activeTab];

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>Friends</h1>
        <p>Manage your friends, following and requests</p>
      </div>

      {/* TABS */}
      <div className="friend-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.url ? "active" : ""}
            onClick={() => handleTabChange(tab)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* GRID */}
      <PeopleGrid
        people={currentTab.list}
        type={activeTab}
        loading={currentTab.loading}
        hasMore={currentTab.hasMore}
        onLoadMore={() => fetchTabData(activeTab)}
      />
    </div>
  );
}
