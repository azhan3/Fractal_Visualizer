import React, { useState, useEffect } from "react";
import "./Styles/toggle.scss";

export let choice = 1;

const ToggleSwitch = ({ onChoiceChange }) => {
  const [localChoice, setLocalChoice] = useState(choice);

  useEffect(() => {
    if (typeof onChoiceChange === "function") {
      onChoiceChange(choice);
    }
  }, [localChoice, onChoiceChange]);

  const handleToggle = () => {
    const newChoice = localChoice === 1 ? 2 : 1;
    setLocalChoice(newChoice);
    choice = newChoice; // Update the exported choice variable
  };

  return (
    <div className="switch-button-container">
      <div className="switch-button">
        <input
          className="switch-button-checkbox"
          type="checkbox"
          checked={localChoice === 2}
          onChange={handleToggle}
        />
        <label className="switch-button-label" htmlFor="">
          <span className="switch-button-label-span">
            Algorithm 1
          </span>
        </label>
      </div>
    </div>
  );
};

export default ToggleSwitch;
