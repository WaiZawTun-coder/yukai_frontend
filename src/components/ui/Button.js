"use client";

import { Button as MuiButton, CircularProgress } from "@mui/material";

const Button = ({
  variant = "contained", // contained, outlined, text
  color = "primary", // primary, secondary, accent
  size = "medium", // small, medium, large
  loading = false, // boolean
  disabled = false, // boolean
  fullWidth = false, // boolean
  startIcon, // <Icon />
  endIcon, // <Icon />
  children, // <Button>children</Button>
  ...props
}) => {
  const isDisabled = disabled || loading;
  const baseColor = `var(--${color}-color)`;

  return (
    <MuiButton
      variant={variant}
      size={size}
      disabled={isDisabled}
      fullWidth={fullWidth}
      startIcon={!loading ? startIcon : undefined}
      endIcon={!loading ? endIcon : undefined}
      sx={{
        textTransform: "none",
        fontWeight: 500,
        borderRadius: 2,
        transition: "all 0.2s ease",
        bgcolor: variant === "contained" ? baseColor : "transparent",
        color: variant === "contained" ? "var(--text-color)" : baseColor,
        border: variant === "outlined" ? `1px solid ${baseColor}` : "none",
        "&:hover": {
          bgcolor: variant === "contained" ? baseColor : "transparent",
          opacity: 0.85,
          transform: "scale(1.02)",
          border: variant === "outlined" ? `1px solid ${baseColor}` : "none",
        },
        "&:active": {
          opacity: 0.75,
          transform: "scale(0.98)",
        },
        "&:focus-visible": {
          outline: `2px solid ${baseColor}`,
          outlineOffset: 2,
        },
        "&.Mui-disabled": {
          bgcolor:
            variant === "contained" ? `var(--${color}-color)` : "transparent",
          color: "var(--status-neutral-text)",
          border:
            variant === "outlined"
              ? "1px solid var(--status-neutral-border)"
              : "none",
          cursor: "not-allowed",
        },
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: "var(--text-color)" }} />
      ) : (
        children
      )}
    </MuiButton>
  );
};

export default Button;
