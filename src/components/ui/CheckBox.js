"use client";

import {
  Checkbox as MuiCheckbox,
  FormControlLabel,
  FormHelperText,
  Box,
} from "@mui/material";

const Checkbox = ({
  label,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  error = false,
  helperText,
  color = "primary", // primary | secondary | accent
  size = "medium",
  labelPlacement = "end",
  ...props
}) => {
  const baseColor = `var(--${color}-color)`;

  return (
    <Box>
      <FormControlLabel
        label={label}
        labelPlacement={labelPlacement}
        control={
          <MuiCheckbox
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            disabled={disabled}
            size={size}
            sx={{
              color: "var(--text-color)",

              /* CHECKED */
              "&.Mui-checked": {
                color: baseColor,
              },

              /* HOVER */
              "&:hover": {
                bgcolor: "transparent",
              },

              /* FOCUS */
              "&.Mui-focusVisible": {
                outline: `2px solid ${baseColor}`,
                outlineOffset: 2,
              },

              /* DISABLED */
              "&.Mui-disabled": {
                color: "var(--disabled-color)",
              },
            }}
            {...props}
          />
        }
        sx={{
          color: disabled ? "var(--disabled-color)" : "var(--text-color)",
          "& .MuiFormControlLabel-label": {
            fontSize: size === "small" ? 13 : 14,
            fontWeight: 500,
          },
        }}
      />

      {helperText && (
        <FormHelperText
          error={error}
          sx={{
            ml: 4,
            color: error ? "var(--status-error-text)" : "var(--text-color)",
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default Checkbox;
