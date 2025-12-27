"use client";

import { useEffect, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

const tabs = [
  { id: 1, tabName: "For You" },
  { id: 2, tabName: "Friends" },
  { id: 3, tabName: "Following" },
];

const TopBar = ({ setData }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const tabsRef = useRef([]);
  const indicatorRef = useRef(null);
  const inputRef = useRef(null);

  // 🔹 Tab indicator logic
  useEffect(() => {
    // fetch data and update
    setData(
      activeIndex == 0 ? "foryou" : activeIndex == 1 ? "friends" : "following"
    );
    const indicator = indicatorRef.current;
    const el = tabsRef.current[activeIndex];
    const container = el?.parentElement;

    if (!indicator || !el || !container) return;

    if (searchActive) {
      indicator.style.opacity = "0";
      return;
    }

    requestAnimationFrame(() => {
      const tabRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const left = tabRect.left - containerRect.left + container.scrollLeft;

      // container.style.justifyContent = "center";
      // container.style.padding = "0 20px";
      indicator.style.opacity = "1";
      indicator.style.width = `${tabRect.width}px`;
      indicator.style.transform = `translateX(${left}px)`;
    });
  }, [activeIndex, searchActive, setData]);

  useEffect(() => {
    const handleResize = () => {
      setActiveIndex((i) => i);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    inputRef.current?.blur();

    setTimeout(() => {
      setSearchText("");
      setSearchActive(false);
    }, 50);
  };

  return (
    <div className="feed-wrapper">
      <div className="navbar">
        {/* BACK BUTTON */}
        <div style={{ display: "inline-flex" }}>
          <button
            className={`back-btn ${searchActive ? "show" : ""}`}
            onClick={handleBack}
          >
            <ArrowBackIosNewRoundedIcon />
          </button>

          {/* TABS */}
          <div className={`nav-tabs ${searchActive ? "hidden" : ""}`}>
            {tabs.map((tab, i) => (
              <span
                key={tab.id}
                ref={(el) => (tabsRef.current[i] = el)}
                className="tab"
                onClick={() => setActiveIndex(i)}
              >
                {tab.tabName}
              </span>
            ))}
            <div
              ref={indicatorRef}
              className={`tab-indicator ${searchActive ? "hidden" : ""}`}
            />
          </div>
        </div>

        {/* SEARCH */}
        <div className={`search-box ${searchActive ? "active" : ""}`}>
          <SearchIcon className="icon" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search..."
            value={searchText}
            onFocus={() => setSearchActive(true)}
            onBlur={() => {
              if (searchText == "") setSearchActive(false);
            }}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
