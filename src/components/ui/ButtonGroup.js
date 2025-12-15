"use client";

import { ButtonGroup as MuiButtonGroup } from "@mui/material";

const ButtonGroup = ({ children, ...props }) => {
  return (
    <MuiButtonGroup
      sx={{
        "& .MuiButton-root": {
          borderColor: "var(--border-color)",
        },
      }}
      {...props}
    >
      {children}
    </MuiButtonGroup>
  );
};

export default ButtonGroup;
