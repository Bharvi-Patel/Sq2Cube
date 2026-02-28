import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1200);

      return () => clearTimeout(timer);
    }else {
    // When all steps finish
    setTimeout(() => {
      onComplete();   
    }, 1000);
  }
  }, [currentStep]);

  return (
    <div className="processing-layout">

      {/* LEFT SIDE - IMAGE */}
      <div className="preview-panel">
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          className="preview-image"
        />
      </div>

      {/* RIGHT SIDE - PROCESSING */}
      <div className="processing-panel">
        <Loader />
        <h2>Processing Image</h2>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${
                index <= currentStep ? "active" : ""
              }`}
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