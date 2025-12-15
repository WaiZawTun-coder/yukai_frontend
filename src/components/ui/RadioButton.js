"use client";

import {
  Radio as MuiRadio,
  RadioGroup,
  FormControlLabel,
  FormHelperText,
  FormControl,
} from "@mui/material";

const RadioButtons = ({
  label, // group label (optional)
  value, // selected value
  defaultValue,
  onChange,
  options = [], // [{ label, value }]
  disabled = false,
  error = false,
  helperText,
  row = false,
  color = "primary", // primary | secondary | accent
  size = "medium",
  ...props
}) => {
  const baseColor = `var(--${color}-color)`;

  return (
    <FormControl error={error} disabled={disabled}>
      {label && (
        <FormHelperText
          sx={{
            mb: 1,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-color)",
          }}
        >
          {label}
        </FormHelperText>
      )}

      <RadioGroup
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        row={row}
        {...props}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            label={option.label}
            control={
              <MuiRadio
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
        ))}
      </RadioGroup>

      {helperText && (
        <FormHelperText
          sx={{
            mt: 0.5,
            color: error ? "var(--disabled-color)" : "var(--text-color)",
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default RadioButtons;
