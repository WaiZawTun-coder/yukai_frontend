"use client";

import {
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";

const Select = ({
  options = [], // options to select in array [{ label, value }]
  value, // selected value
  defaultValue, // default selected value
  onChange, // action on change
  label, // field label
  placeholder, // placeholder text
  disabled = false, // boolean
  error = false, // boolean
  helperText, // text below input box
  multiple = false, // boolean
  fullWidth = true, // boolean
  size = "medium", // small | medium
  color = "primary", // primary, secondary, accent
  renderValue,
  ...props
}) => {
  const baseColor = `var(--${color}-color)`;

  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      disabled={disabled}
      error={error}
      sx={{
        /* INPUT ROOT */
        "& .MuiOutlinedInput-root": {
          bgcolor: "var(--background-color)",
          borderColor: "var(--text-color)",
        },

        /* SELECTED VALUE (IMPORTANT) */
        "& .MuiSelect-select": {
          color: "var(--text-color)",
        },

        /* LABEL */
        "& .MuiInputLabel-root": {
          color: "var(--text-color)",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "var(--text-color)",
        },

        /* DISABLED */
        "&.Mui-disabled": {
          color: "var(--disabled-color)",
        },

        /* DROPDOWN ICON */
        "& .MuiSelect-icon": {
          color: "var(--text-color)",
          opacity: 0.6,
          transition: "color 0.2s ease",
          "&:hover": {
            color: baseColor,
            opacity: 1,
          },
        },

        /* HELPER TEXT */
        "& .MuiFormHelperText-root": {
          color: error ? "var(--disabled-color)" : "var(--text-color)",
        },

        /* DEFAULT BORDER */
        "& .MuiOutlinedInput-notchedOutline": {
          //   borderColor: "var(--accent-color)",
        },

        /* HOVER BORDER */
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: baseColor,
        },

        /* FOCUS BORDER */
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: baseColor,
            borderWidth: 2,
          },

        /* ERROR BORDER */
        "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--disabled-color)",
        },

        /* DISABLED BORDER */
        "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline":
          {
            borderColor: "var(--disabled-color)",
          },

        "& .MuiSelect-icon": {
          color: "var(--text-color)",
        },
      }}
    >
      {label && <InputLabel>{label}</InputLabel>}

      <MuiSelect
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        multiple={multiple}
        displayEmpty
        renderValue={
          value === "" && placeholder
            ? () => (
                <span style={{ color: "var(--disabled-color)" }}>
                  {placeholder}
                </span>
              )
            : renderValue
        }
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "var(--background-color)",
              color: "var(--text-color)",

              "& .MuiMenuItem-root": {
                bgcolor: "transparent",
                color: "var(--text-color)",

                "&.Mui-selected": {
                  bgcolor: "var(--background-color)",
                  fontWeight: 600,
                },

                "&.Mui-selected:hover": {
                  bgcolor: "var(--accent-color)",
                },

                "&:hover": {
                  bgcolor: "var(--accent-color)",
                },
              },
            },
          },
        }}
        sx={{
          "& .MuiOutlinedSelect-root": {
            bgcolor: "var(--background-color)",
          },
        }}
        {...props}
      >
        {placeholder && !multiple && (
          <MenuItem disabled value="">
            {placeholder}
          </MenuItem>
        )}

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
