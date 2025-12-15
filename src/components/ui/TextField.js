"use client";

import { TextField as MuiTextField } from "@mui/material";

const TextField = ({
  variant = "outlined", // outlined, filled, standard
  size = "medium", // small, medium, large
  color = "primary", // primary, secondary, accent
  label, // input label
  helperText, // text below input box
  error = false, // boolean
  disabled = false, // boolean
  required = false, // boolean
  readOnly = false, // boolean
  multiline = false, // boolean
  rows, // number
  fullWidth = true, // boolean
  InputProps,
  InputLabelProps,
  ...props
}) => {
  const baseColor = `var(--${color}-color)`;

  return (
    <MuiTextField
      variant={variant}
      size={size}
      label={label}
      helperText={helperText}
      error={error}
      disabled={disabled}
      required={required}
      multiline={multiline}
      rows={rows}
      fullWidth={fullWidth}
      InputProps={{
        readOnly,
        ...InputProps,
      }}
      InputLabelProps={InputLabelProps}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "var(--background-color)",
          color: "var(--text-color)",
          transition: "all 0.2s ease",
          "&:hover fieldset": {
            borderColor: baseColor,
          },
          "&.Mui-focused fieldset": {
            borderColor: baseColor,
            borderWidth: 2,
          },
          "&.Mui-disabled": {
            bgcolor: "transparent",
            color: "var(--status-neutral-text)",
          },
        },
        "& .MuiInputLabel-root": {
          color: "var(--text-color)",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "var(--text-color)",
        },
        "& .MuiInputLabel-root.Mui-error": {
          color: "var(--status-error-text)",
        },
        "& .MuiOutlinedInput-root.Mui-error fieldset": {
          borderColor: "var(--status-error-border)",
        },
        "& .MuiFormHelperText-root": {
          color: error ? "var(--status-error-text)" : "var(--text-color)",
        },
      }}
      {...props}
    />
  );
};

export default TextField;
