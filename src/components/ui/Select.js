"use client";

import {
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";

const Select = ({
  options = [], // [{ label, value }]
  value = "",
  onChange,
  label,
  placeholder,
  disabled = false,
  error = false,
  helperText,
  multiple = false,
  fullWidth = true,
  size = "medium",
  color = "accent",
  ...props
}) => {
  const baseColor = `var(--${color}-color)`;

  return (
    <FormControl
      variant="outlined"
      fullWidth={fullWidth}
      size={size}
      disabled={disabled}
      error={error}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "transparent",
          color: "var(--text-color)",
          borderRadius: "8px",
          transition: "all 0.2s ease",

          "& fieldset": {
            borderColor: "var(--border-default)",
          },

          "&:hover fieldset": {
            borderColor: "var(--border-focus)",
          },

          "&.Mui-focused fieldset": {
            borderColor: baseColor,
            borderWidth: 2,
          },

          "&.Mui-error fieldset": {
            borderColor: "var(--status-error-border)",
          },

          "&.Mui-disabled fieldset": {
            borderColor: "var(--disabled-color)",
          },
        },

        "& .MuiInputLabel-root": {
          fontSize: "16px",
          color: "var(--text-color)",
        },

        "& .MuiInputLabel-root.Mui-focused": {
          color: "var(--text-color)",
        },

        "& .MuiInputLabel-root.Mui-error": {
          color: "var(--status-error-text)",
        },

        "& .MuiSelect-icon": {
          color: "var(--text-color)",
          opacity: 0.6,
        },

        "& .MuiFormHelperText-root": {
          color: error ? "var(--status-error-text)" : "var(--text-color)",
        },
      }}
    >
      {label && <InputLabel>{label}</InputLabel>}

      <MuiSelect
        label={label}
        value={value}
        onChange={onChange}
        multiple={multiple}
        {...props}
      >
        {/* Placeholder */}
        {placeholder && !multiple && (
          <MenuItem value="" disabled>
            <span style={{ color: "var(--disabled-color)" }}>
              {placeholder}
            </span>
          </MenuItem>
        )}

        {/* Options */}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
