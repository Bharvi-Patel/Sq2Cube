import React, { useEffect, useState, useRef } from "react";
import Loader from "../Loader";

const steps = [
  "Uploading Image...",
  "Analyzing Structure...",
  "Generating 3D Mesh...",
  "Applying Textures...",
  "Finalizing Model..."
];

const ProcessingSection = ({ file, prompt, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Generate object URL once — avoid calling createObjectURL on every render
  const previewUrl = useRef(
    file instanceof File ? URL.createObjectURL(file) : null
  ).current;

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="processing-layout">

      {/* LEFT SIDE - IMAGE (only shown if a file was uploaded) */}
      <div className="preview-panel">
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="preview-image"/>
        ) : (
          <div className="preview-placeholder">
            <p>Generating from prompt...</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDE - PROCESSING STEPS */}
      <div className="processing-panel">
        <Loader />
        <h2>Processing{file ? " Image" : " Prompt"}</h2>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index <= currentStep ? "active" : ""}`}
            >
              {index < currentStep ? "✔" : index === currentStep ? "⏳" : "•"}
              <span>{step}</span>
            </div>
          ))}
        </div>

        {prompt && (
          <div className="processing-prompt">
            <span>Prompt:</span>
            <p>{prompt}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProcessingSection;