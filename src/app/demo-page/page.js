"use client";

import { ThemeToggler } from "@/components/ui/theme-toggler";
import { FormControl, FormControlLabel, FormGroup } from "@mui/material";
import { useState } from "react";

const Testing = () => {
  const [counter, setCounter] = useState(0);

  const handleIncrease = () => {
    setCounter((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setCounter((prev) => prev - 1);
  };

  return (
    <div className="demo-container">
      <h3 className="heading">Testing</h3>
      <button onClick={handleDecrease}>-</button>
      <h3 className="counter-display">{counter}</h3>
      <button onClick={handleIncrease}>+</button>
    </div>
  );
};

export default Testing;
