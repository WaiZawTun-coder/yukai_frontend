"use client";

import { Box, Step, StepConnector, StepLabel, Stepper } from "@mui/material";
import { styled } from "@mui/material/styles";

/* ---------- Custom Connector ---------- */
const Connector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": {
    borderColor: "var(--border-default)",
    borderTopWidth: 2,
    borderRadius: 1,
  },
  "&.Mui-active .MuiStepConnector-line": {
    borderColor: "var(--accent-color)",
  },
  "&.Mui-completed .MuiStepConnector-line": {
    borderColor: "var(--accent-color)",
  },
}));

/* ---------- Custom Step Icon ---------- */
const StepIconRoot = styled("div")(({ ownerState }) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "2px solid var(--border-default)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600,
  fontSize: 14,
  color: "var(--text-color)",
  transition: "all 0.2s ease",

  ...(ownerState.active && {
    borderColor: "var(--accent-color)",
    background: "var(--accent-color)",
    color: "#fff",
  }),

  ...(ownerState.completed && {
    borderColor: "#5ab85b",
    background: "#5ab85b",
    color: "#fff",
  }),
}));

const StepIcon = (props) => {
  const { active, completed, icon } = props;

  return <StepIconRoot ownerState={{ active, completed }}>{icon}</StepIconRoot>;
};

/* ---------- Reusable Stepper ---------- */
const AppStepper = ({
  steps = [], // [{ label }]
  activeStep = 0, // zero-based index
}) => {
  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<Connector />}
      >
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel StepIconComponent={StepIcon}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default AppStepper;
