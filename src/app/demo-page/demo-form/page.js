"use client";

import DynamicForm from "@/components/DynamicForm";

// icons
import { Box, Divider } from "@mui/material";
import { useState } from "react";

const DemoForm = () => {
  const [isDark, setIsDark] = useState(false);

  // Example JSON configuration for DynamicForm
  const formConfig = {
    fields: [
      {
        type: "textfield",
        name: "fullName",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        defaultValue: "",
        variant: "outlined",
        size: "medium",
        color: "primary",
      },
      {
        type: "textfield",
        name: "email",
        label: "Email Address",
        placeholder: "Enter your email",
        required: true,
        defaultValue: "",
        variant: "outlined",
        color: "primary",
      },
      {
        type: "textfield",
        name: "description",
        label: "Description",
        placeholder: "Enter a description",
        multiline: true,
        rows: 4,
        defaultValue: "",
        color: "primary",
      },
      {
        type: "select",
        name: "country",
        label: "Country",
        options: [
          { label: "United States", value: "us" },
          { label: "Canada", value: "ca" },
          { label: "United Kingdom", value: "uk" },
          { label: "Australia", value: "au" },
        ],
        required: true,
        color: "primary",
      },
      {
        type: "autocomplete",
        name: "framework",
        label: "Framework",
        placeholder: "Select or type a framework",
        options: ["React", "Next.js", "Vue", "Angular", "Svelte"],
        freeSolo: false,
        multiple: false,
        color: "primary",
      },
      {
        type: "autocomplete",
        name: "skills",
        label: "Skills",
        placeholder: "Select multiple skills",
        options: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust"],
        multiple: true,
        color: "secondary",
      },
      {
        type: "radiobuttons",
        name: "gender",
        label: "Gender",
        options: [
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
          { label: "Other", value: "other" },
        ],
        row: true,
        color: "primary",
      },
      {
        type: "checkbox",
        name: "terms",
        label: "I agree to the terms and conditions",
        required: true,
        defaultValue: false,
        color: "primary",
      },
      {
        type: "checkbox",
        name: "newsletter",
        label: "Subscribe to newsletter",
        defaultValue: false,
        color: "secondary",
      },
      {
        type: "buttongroup",
        buttons: [
          {
            type: "button",
            label: "Cancel",
            variant: "outlined",
            color: "primary",
          },
          {
            type: "submit",
            label: "Submit",
            variant: "contained",
            color: "primary",
          },
          {
            type: "button",
            label: "Reset",
            variant: "outlined",
            color: "secondary",
          },
        ],
      },
    ],
    layout: {
      columns: 1,
      spacing: 2,
    },
    validationSchema: {
      email: {
        required: true,
        requiredMessage: "Email is required",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: "Please enter a valid email address",
      },
      fullName: {
        required: true,
        requiredMessage: "Full name is required",
        minLength: 2,
        minLengthMessage: "Full name must be at least 2 characters",
      },
    },
  };

  const handleDynamicFormSubmit = (formData) => {
    console.log("Form submitted with data:", formData);
    alert("Form submitted! Check console for form data.");
  };

  return (
    <div>
      <Divider sx={{ my: 4 }} />

      {/* Dynamic Form Example */}
      <Box>
        <h4 style={{ marginBottom: "1rem" }}>Dynamic Form (JSON-driven)</h4>
        <DynamicForm
          fields={formConfig.fields}
          onSubmit={handleDynamicFormSubmit}
          layout={formConfig.layout}
          validationSchema={formConfig.validationSchema}
        />
      </Box>
    </div>
  );
};

export default DemoForm;
