"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Autocomplete from "@/components/ui/Autocomplete";
import Checkbox from "@/components/ui/CheckBox";
import RadioButtons from "@/components/ui/RadioButton";
import Button from "@/components/ui/Button";
import ButtonGroup from "@/components/ui/ButtonGroup";
import { Box, Grid } from "@mui/material";

/**
 * DynamicForm Component
 *
 * Renders a form dynamically based on JSON configuration.
 *
 * @param {Object} props
 * @param {Array} props.fields - Array of field configurations
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {Object} props.initialValues - Initial form values
 * @param {Object} props.validationSchema - Validation rules (optional)
 * @param {Object} props.layout - Layout configuration (columns, spacing, etc.)
 *
 * Field Configuration Format:
 * {
 *   type: 'textfield' | 'select' | 'autocomplete' | 'checkbox' | 'radiobuttons' | 'button' | 'buttongroup',
 *   name: string, // field name (required for form data)
 *   label: string, // field label
 *   placeholder: string,
 *   defaultValue: any,
 *   required: boolean,
 *   disabled: boolean,
 *   error: boolean,
 *   helperText: string,
 *   // Component-specific props
 *   ...componentProps
 * }
 */
const DynamicForm = ({
  fields = [],
  onSubmit,
  initialValues = {},
  validationSchema,
  layout = { columns: 1, spacing: 2 },
  ...formProps
}) => {
  const [formValues, setFormValues] = useState(() => {
    const values = { ...initialValues };
    fields.forEach((field) => {
      if (
        field.name &&
        field.defaultValue !== undefined &&
        values[field.name] === undefined
      ) {
        values[field.name] = field.defaultValue;
      }
    });
    return values;
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const lastSubmitTimeRef = useRef(0);

  const validateField = (name, value, rules) => {
    if (!rules) return null;

    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      return rules.requiredMessage || `${name} is required`;
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.patternMessage || `${name} format is invalid`;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return (
        rules.minLengthMessage ||
        `${name} must be at least ${rules.minLength} characters`
      );
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return (
        rules.maxLengthMessage ||
        `${name} must be at most ${rules.maxLength} characters`
      );
    }

    if (rules.validate && typeof rules.validate === "function") {
      const customError = rules.validate(value);
      if (customError) return customError;
    }

    return null;
  };

  const handleFieldChange = useCallback((name, value) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is changed using functional update
    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleFieldBlur = useCallback(
    (name) => {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate on blur if validation schema exists
      if (validationSchema && validationSchema[name]) {
        // Read current form value using functional state update
        setFormValues((currentValues) => {
          const error = validateField(
            name,
            currentValues[name],
            validationSchema[name]
          );
          if (error) {
            setErrors((prev) => ({
              ...prev,
              [name]: error,
            }));
          } else {
            setErrors((prev) => {
              if (prev[name]) {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
              }
              return prev;
            });
          }
          return currentValues; // No actual state change
        });
      }
    },
    [validationSchema]
  );

  const validateForm = useCallback(
    (values = null) => {
      const valuesToValidate = values || formValues;
      const newErrors = {};
      let isValid = true;

      fields.forEach((field) => {
        if (!field.name) return;

        const value = valuesToValidate[field.name];
        const isRequired =
          field.required || validationSchema?.[field.name]?.required;

        if (
          isRequired &&
          (value === undefined || value === null || value === "")
        ) {
          newErrors[field.name] =
            validationSchema?.[field.name]?.requiredMessage ||
            `${field.label || field.name} is required`;
          isValid = false;
        } else if (validationSchema?.[field.name]) {
          const error = validateField(
            field.name,
            value,
            validationSchema[field.name]
          );
          if (error) {
            newErrors[field.name] = error;
            isValid = false;
          }
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [fields, validationSchema, formValues]
  );

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      e?.stopPropagation();

      // Prevent double submission using timestamp guard (handles React StrictMode)
      const now = Date.now();
      const timeSinceLastSubmit = now - lastSubmitTimeRef.current;

      // Ignore submissions within 300ms of each other (prevents double calls)
      if (timeSinceLastSubmit < 300) {
        return;
      }

      lastSubmitTimeRef.current = now;

      // Validate and submit
      const isValid = validateForm(formValues);

      if (isValid && onSubmit) {
        onSubmit(formValues, formValues);
      }
    },
    [onSubmit, validateForm, formValues]
  );

  // Memoize field change handlers per field name to prevent recreating functions
  const getFieldChangeHandler = useCallback(
    (name) => {
      if (!name) return undefined;
      return (e) => handleFieldChange(name, e.target.value);
    },
    [handleFieldChange]
  );

  const getFieldBlurHandler = useCallback(
    (name) => {
      if (!name) return undefined;
      return () => handleFieldBlur(name);
    },
    [handleFieldBlur]
  );

  const getCheckboxChangeHandler = useCallback(
    (name) => {
      if (!name) return undefined;
      return (e) => handleFieldChange(name, e.target.checked);
    },
    [handleFieldChange]
  );

  const getAutocompleteChangeHandler = useCallback(
    (name) => {
      if (!name) return undefined;
      return (event, newValue) => handleFieldChange(name, newValue);
    },
    [handleFieldChange]
  );

  const renderField = useCallback(
    (field, index) => {
      const {
        type,
        name,
        label,
        placeholder,
        defaultValue,
        required,
        disabled,
        error: fieldError,
        helperText,
        ...componentProps
      } = field;

      const value = name ? formValues[name] : undefined;
      const hasError = fieldError || (name && errors[name] && touched[name]);
      const errorMessage =
        name && errors[name] && touched[name] ? errors[name] : helperText;

      const commonProps = {
        key: field.id || name || index,
        label,
        placeholder,
        disabled,
        error: hasError,
        helperText: errorMessage,
        fullWidth: true,
      };

      switch (type) {
        case "textfield":
          return (
            <TextField
              {...commonProps}
              name={name}
              value={value ?? ""}
              onChange={getFieldChangeHandler(name)}
              onBlur={getFieldBlurHandler(name)}
              required={required}
              {...componentProps}
            />
          );

        case "select":
          return (
            <Select
              {...commonProps}
              name={name}
              value={value ?? (componentProps.multiple ? [] : "")}
              onChange={getFieldChangeHandler(name)}
              onBlur={getFieldBlurHandler(name)}
              options={componentProps.options || []}
              {...componentProps}
            />
          );

        case "autocomplete":
          return (
            <Autocomplete
              {...commonProps}
              name={name}
              value={value ?? (componentProps.multiple ? [] : null)}
              onChange={getAutocompleteChangeHandler(name)}
              onBlur={getFieldBlurHandler(name)}
              options={componentProps.options || []}
              {...componentProps}
            />
          );

        case "checkbox":
          return (
            <Checkbox
              {...commonProps}
              name={name}
              checked={value ?? false}
              onChange={getCheckboxChangeHandler(name)}
              {...componentProps}
            />
          );

        case "radiobuttons":
          return (
            <RadioButtons
              {...commonProps}
              name={name}
              value={value ?? ""}
              onChange={getFieldChangeHandler(name)}
              onBlur={getFieldBlurHandler(name)}
              options={componentProps.options || []}
              {...componentProps}
            />
          );

        case "button":
          const buttonType = componentProps.type || "button";
          return (
            <Button
              key={field.id || index}
              onClick={
                componentProps.onClick ||
                (buttonType === "submit"
                  ? undefined // Let form onSubmit handle it for submit buttons
                  : undefined)
              }
              type={buttonType}
              {...componentProps}
            >
              {label || componentProps.children}
            </Button>
          );

        case "buttongroup":
          const buttons = componentProps.buttons || [];
          return (
            <ButtonGroup key={field.id || index} {...componentProps}>
              {buttons.map((button, btnIndex) => {
                const btnType = button.type || "button";
                return (
                  <Button
                    key={button.id || btnIndex}
                    onClick={
                      button.onClick ||
                      (btnType === "submit"
                        ? undefined // Let form onSubmit handle it for submit buttons
                        : undefined)
                    }
                    type={btnType}
                    {...button}
                  >
                    {button.label || button.children}
                  </Button>
                );
              })}
            </ButtonGroup>
          );

        default:
          console.warn(`Unknown field type: ${type}`);
          return null;
      }
    },
    [
      formValues,
      errors,
      touched,
      getFieldChangeHandler,
      getFieldBlurHandler,
      getCheckboxChangeHandler,
      getAutocompleteChangeHandler,
    ]
  );

  // Memoize the rendered fields to prevent unnecessary re-renders
  const renderedFields = useMemo(
    () => fields.map((field, index) => renderField(field, index)),
    [fields, renderField]
  );

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate {...formProps}>
      <Grid container spacing={layout.spacing || 2} direction="column">
        {renderedFields.map((fieldElement, index) => {
          const field = fields[index];
          // All fields render in a vertical layout (full width)
          return (
            <Grid item xs={12} key={field.id || field.name || index}>
              {fieldElement}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DynamicForm;
