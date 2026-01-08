"use client";

import SnackbarItem from "./SnackbarItem";

const Snackbar = ({ snacks, onRemove }) => {
  return (
    <div className="snackbar-container">
      {snacks.map((snack) => (
        <SnackbarItem
          key={snack.id}
          title={snack.title}
          message={snack.message}
          variant={snack.variant}
          duration={snack.duration}
          onClose={() => onRemove(snack.id)}
        />
      ))}
    </div>
  );
};

export default Snackbar;
