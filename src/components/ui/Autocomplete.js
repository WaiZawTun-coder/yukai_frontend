"use client";

import {
  Autocomplete as MuiAutocomplete,
  CircularProgress,
} from "@mui/material";
import TextField from "./TextField";

const Autocomplete = ({
  options = [], // options to select in array
  value, // string
  defaultValue, // current selected value
  onChange, // action on changing the selected value
  label, // to indicate what this component is used for
  placeholder, // to indicate what this component is used for
  loading = false, // boolean
  disabled = false, // boolean
  error = false, // boolean
  helperText, // text below input box
  multiple = false, // boolean
  freeSolo = false, // boolean
  clearOnEscape = true, // boolean (to clear invalid value)
  fullWidth = true, // boolean
  color = "primary", // pirmary, secondary, accent
  renderOption,
  getOptionLabel,
  isOptionEqualToValue,
  ...props
}) => {
  const baseColor = `var(--${color}-color)`;

  return (
    <MuiAutocomplete
      options={options}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      loading={loading}
      disabled={disabled}
      multiple={multiple}
      freeSolo={freeSolo}
      clearOnEscape={clearOnEscape}
      fullWidth={fullWidth}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      renderOption={renderOption}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress
                    size={18}
                    sx={{ color: "var(--text-color)", mr: 1 }}
                  />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "var(--background-color)",
            color: "var(--text-color)",
            "& .MuiAutocomplete-option": {
              bgcolor: "transparent",
              color: "var(--text-color)",
              '&[aria-selected="true"]': {
                bgcolor: "var(--background-color)",
                fontWeight: 600,
              },
              "&.Mui-focused": {
                bgcolor: "var(--accent-color)",
              },
            },
            "& .MuiAutocomplete-loading": {
              color: "var(--text-color)",
              fontWeight: 500,
            },
          },
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "var(--background-color)",
        },
        "& .MuiInputLabel-root": {
          color: "var(--text-color)",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "var(--text-color)",
        },
        "& .MuiAutocomplete-paper": {
          bgcolor: "var(--background-color)",
        },
        "& .MuiAutocomplete-option": {
          bgcolor: "transparent",
          color: "var(--text-color)",
        },
        "& .MuiAutocomplete-option.Mui-focused": {
          bgcolor: "var(--accent-color)",
        },

        "& .MuiAutocomplete-option[aria-selected='true']": {
          bgcolor: `var(--background-color)`,
          color: "var(--text-color)",
        },
        "&.Mui-disabled": {
          color: "var(--text-color)",
        },
        "& .MuiChip-root": {
          bgcolor: `var(--${color}-color)`,
          color: "var(--text-color)",
          borderRadius: 1,
        },
        "& .MuiChip-label": {
          color: "var(--text-color)",
          fontWeight: 500,
        },
        "& .MuiChip-deleteIcon": {
          color: "var(--text-color)",
          opacity: 0.7,
          "&:hover": {
            opacity: 1,
          },
        },
        "& .MuiAutocomplete-clearIndicator": {
          color: "var(--text-color)",
          opacity: 0.6,

          "&:hover": {
            color: `var(--text-color)`,
            opacity: 1,
          },
        },
        "& .MuiAutocomplete-popupIndicator": {
          color: "var(--text-color)",
          opacity: 0.6,
          transition: "transform 0.2s ease, color 0.2s ease",
          "&:hover": {
            color: `var(--${color}-color)`,
            opacity: 1,
          },
        },
      }}
      {...props}
    />
  );
};

export default Autocomplete;
