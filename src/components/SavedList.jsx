"use client";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const SavedList = ({ setSelectedSavedList, savedLists }) => {
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2) // max 2 letters
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  return (
    <div className="saved-list-container">
      {/* SAVED LISTS */}
      <div className="saved-lists">
        {savedLists.length === 0 ? (
          <div className="empty-state">No saved lists yet</div>
        ) : (
          savedLists.map((list, i) => (
            <div
              key={i}
              className="saved-list-item"
              onClick={() => setSelectedSavedList(list)}
            >
              <div className="saved-list-left">
                <div className="saved-list-icon">{getInitials(list.name)}</div>

                <span className="saved-list-name">{list.name}</span>
              </div>

              <KeyboardArrowRightIcon className="arrow-icon" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedList;
