"use client";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import MessageIcon from "@mui/icons-material/Message";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useKeyboard } from "./postComposer/useKeyboard";

const tabs = [
  { id: 1, tabName: "For You", url: "?type=recommend" },
  { id: 2, tabName: "Friends", url: "?type=friends" },
  { id: 3, tabName: "Following", url: "?type=following" },
];

const TopBar = ({ setData }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [hidden, setHidden] = useState(false);

  const params = useSearchParams();
  const router = useRouter();

  const lastScrollY = useRef(0);
  const tabsRef = useRef([]);
  const indicatorRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  useKeyboard({
    enabled: true,
    onSearch: () => inputRef.current?.focus(),
  });

  /* -------------------- Debounced Search -------------------- */
  useEffect(() => {
    if (!searchActive && searchText == "") return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      if (searchText.trim() == "") return;
      router.replace(`/search?q=${searchText}`);
      // Nothing else needed here; searchText is passed to SearchResults
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [router, searchActive, searchText]);

  /* -------------------- Active tab based on URL -------------------- */
  useEffect(() => {
    const type = params.get("type");
    tabs.forEach((tab, index) => {
      if (tab.url.split("=")[1] == type) {
        setActiveIndex(index);
        setData(type);
      }
    });
  }, [params, setData]);

  /* -------------------- Hide/show on scroll -------------------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (Math.abs(currentY - lastScrollY.current) < 10) return;
      setHidden(currentY > lastScrollY.current && currentY > 80);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* -------------------- Tab indicator -------------------- */
  useEffect(() => {
    const indicator = indicatorRef.current;
    const el = tabsRef.current[activeIndex];
    const container = el?.parentElement;
    if (!indicator || !el || !container) return;

    if (searchActive) {
      indicator.style.opacity = "0";
      inputRef.current?.focus();
      return;
    }

    requestAnimationFrame(() => {
      const tabRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const left = tabRect.left - containerRect.left + container.scrollLeft;

      indicator.style.opacity = "1";
      indicator.style.width = `${tabRect.width}px`;
      indicator.style.transform = `translateX(${left}px)`;
    });
  }, [activeIndex, searchActive]);

  /* -------------------- Push URL on tab change -------------------- */
  useEffect(() => {
    if (activeIndex != null) router.push(tabs[activeIndex].url);
  }, [activeIndex, router]);

  useEffect(() => {
    const handleResize = () => setActiveIndex((i) => i);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* -------------------- Handlers -------------------- */
  const handleBack = () => {
    inputRef.current?.blur();
    setTimeout(() => {
      setSearchText("");
      setSearchActive(false);
    }, 50);
  };

  const handleInputChange = (e) => setSearchText(e.target.value);

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      // Optional: trigger immediate search
    }
  };

  const handleInputBlur = () => {
    if (!searchText) setSearchActive(false);
  };

  return (
    <div className={`feed-wrapper ${hidden ? "topbar--hidden" : ""}`}>
      <div className="navbar">
        <div style={{ display: "inline-flex" }}>
          {/* BACK BUTTON */}
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

        <div className={`header-action ${searchActive ? "active" : ""}`}>
          {/* SEARCH */}
          <div
            className={`search-box ${searchActive ? "active" : ""}`}
            onClick={() => setSearchActive(true)}
          >
            <SearchIcon className="icon" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search..."
              value={searchText}
              onFocus={() => setSearchActive(true)}
              onBlur={handleInputBlur}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
            />
          </div>
          {/* chat icon */}
          <MessageIcon
            onClick={() => router.push("/chat")}
            className="chat-icon"
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
