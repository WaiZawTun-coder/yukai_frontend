"use client";

import SnackbarItem from "./SnackbarItem";

const Snackbar = ({ snacks, onRemove }) => {
  return (
    <div className="snackbar-container">
      {snacks.map((snack) => (
        <SnackbarItem
          key={snack.id}
          {...snack}
          onClose={() => onRemove(snack.id)}
        />
      ))}
    </div>
  );
};

export default Snackbar;
