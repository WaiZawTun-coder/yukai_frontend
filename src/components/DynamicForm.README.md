# DynamicForm Component

A flexible, JSON-driven form component that can render any UI component from `components/ui` based on configuration.

## Features

- ✅ Supports all UI components: TextField, Select, Autocomplete, Checkbox, RadioButtons, Button, ButtonGroup
- ✅ Form state management with controlled inputs
- ✅ Built-in validation with customizable rules
- ✅ Error handling and display
- ✅ Responsive grid layout
- ✅ Type-safe field configuration

## Basic Usage

```jsx
import DynamicForm from "@/components/DynamicForm";

const formConfig = {
  fields: [
    {
      type: "textfield",
      name: "username",
      label: "Username",
      required: true,
    },
    {
      type: "select",
      name: "country",
      label: "Country",
      options: [
        { label: "USA", value: "us" },
        { label: "Canada", value: "ca" },
      ],
    },
  ],
  validationSchema: {
    username: {
      required: true,
      minLength: 3,
    },
  },
};

function MyComponent() {
  const handleSubmit = (formData) => {
    console.log("Form data:", formData);
  };

  return (
    <DynamicForm
      fields={formConfig.fields}
      onSubmit={handleSubmit}
      validationSchema={formConfig.validationSchema}
    />
  );
}
```

## Field Types

### TextField

```json
{
  "type": "textfield",
  "name": "fullName",
  "label": "Full Name",
  "placeholder": "Enter your name",
  "required": true,
  "multiline": false,
  "rows": 4,
  "variant": "outlined",
  "size": "medium",
  "color": "primary"
}
```

### Select

```json
{
  "type": "select",
  "name": "country",
  "label": "Country",
  "placeholder": "Select a country",
  "options": [
    { "label": "USA", "value": "us" },
    { "label": "Canada", "value": "ca" }
  ],
  "multiple": false,
  "required": true,
  "color": "primary"
}
```

### Autocomplete

```json
{
  "type": "autocomplete",
  "name": "framework",
  "label": "Framework",
  "options": ["React", "Next.js", "Vue"],
  "multiple": false,
  "freeSolo": false,
  "color": "primary"
}
```

### Checkbox

```json
{
  "type": "checkbox",
  "name": "terms",
  "label": "I agree to the terms",
  "defaultValue": false,
  "required": true,
  "color": "primary"
}
```

### RadioButtons

```json
{
  "type": "radiobuttons",
  "name": "gender",
  "label": "Gender",
  "options": [
    { "label": "Male", "value": "male" },
    { "label": "Female", "value": "female" }
  ],
  "row": true,
  "color": "primary"
}
```

### Button

```json
{
  "type": "button",
  "label": "Submit",
  "variant": "contained",
  "color": "primary",
  "type": "submit"
}
```

### ButtonGroup

```json
{
  "type": "buttongroup",
  "buttons": [
    {
      "type": "button",
      "label": "Cancel",
      "variant": "outlined",
      "color": "primary"
    },
    {
      "type": "submit",
      "label": "Submit",
      "variant": "contained",
      "color": "primary"
    }
  ]
}
```

## Validation Schema

The validation schema supports:

- `required`: Boolean - Field is required
- `requiredMessage`: String - Custom error message for required field
- `pattern`: RegExp - Pattern to validate against
- `patternMessage`: String - Custom error message for pattern mismatch
- `minLength`: Number - Minimum length
- `minLengthMessage`: String - Custom error message
- `maxLength`: Number - Maximum length
- `maxLengthMessage`: String - Custom error message
- `validate`: Function - Custom validation function

```javascript
validationSchema: {
  email: {
    required: true,
    requiredMessage: "Email is required",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: "Please enter a valid email address",
  },
  username: {
    required: true,
    minLength: 3,
    minLengthMessage: "Username must be at least 3 characters",
    validate: (value) => {
      if (value.includes(" ")) {
        return "Username cannot contain spaces";
      }
      return null;
    },
  },
}
```

## Layout Configuration

```javascript
layout: {
  columns: 1,  // Number of columns (default: 1)
  spacing: 2,  // Grid spacing (default: 2)
}
```

## Props

| Prop               | Type     | Default                      | Description                                          |
| ------------------ | -------- | ---------------------------- | ---------------------------------------------------- |
| `fields`           | Array    | `[]`                         | Array of field configurations                        |
| `onSubmit`         | Function | -                            | Callback when form is submitted `(formData) => void` |
| `initialValues`    | Object   | `{}`                         | Initial form values                                  |
| `validationSchema` | Object   | `{}`                         | Validation rules for fields                          |
| `layout`           | Object   | `{ columns: 1, spacing: 2 }` | Layout configuration                                 |

## Form Data Structure

The form data is an object where keys are field `name` values:

```javascript
{
  fullName: "John Doe",
  email: "john@example.com",
  country: "us",
  framework: "React",
  skills: ["JavaScript", "TypeScript"],
  gender: "male",
  terms: true,
  newsletter: false
}
```

## Example

See `src/app/demo-page/demo-form/page.js` for a complete example with all field types.
