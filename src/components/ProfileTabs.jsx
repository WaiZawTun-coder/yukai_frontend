"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TABS = [
  { id: 1, name: "Posts", url: "posts" },
  { id: 2, name: "Images", url: "images" },
  // { id: 3, name: "Saved", url: "saved" },
  //   { id: 4, name: "Tagged", url: "tagged" },
];

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabsRef = useRef([]);
  const indicatorRef = useRef(null);
  const searchParams = useSearchParams();

  //   const [activeTab, setActiveTab] = useState(null);
  const [tabsReady, setTabsReady] = useState(false);

  /* ---------------- READ TAB FROM URL ---------------- */

  useEffect(() => {
    const update = () => {
      const tabFromUrl = searchParams.get("tab");
      const index = TABS.findIndex((t) => t.url === tabFromUrl);
      setActiveTab(index === -1 ? 0 : index);
    };

    update();
  }, [searchParams]);

  /* ---------------- MARK TABS READY ---------------- */

  useEffect(() => {
    const check = () => {
      if (tabsRef.current.filter(Boolean).length === TABS.length) {
        setTabsReady(true);
      }
    };
    check();
  }, []);

  /* ---------------- MOVE INDICATOR ---------------- */

  useLayoutEffect(() => {
    if (activeTab === null || !tabsReady) return;

    const el = tabsRef.current[activeTab];
    const indicator = indicatorRef.current;

    if (!el || !indicator) return;

    requestAnimationFrame(() => {
      indicator.style.opacity = "1";
      indicator.style.width = `${el.offsetWidth}px`;
      indicator.style.transform = `translateX(${el.offsetLeft - 16}px)`;
    });
  }, [activeTab, tabsReady]);

  useEffect(() => {
    if (activeTab != null) setActiveTab(activeTab);
  }, [activeTab, setActiveTab]);

  return (
    <div className="tabs profile-tabs">
      {TABS.map((tab, i) => (
        <span
          key={tab.id}
          ref={(el) => (tabsRef.current[i] = el)}
          className={`tab`}
          onClick={() => setActiveTab(i)}
        >
          {tab.name}
        </span>
      ))}

      <div ref={indicatorRef} className="tab-indicator" />
    </div>
  );
};

export default ProfileTabs;
