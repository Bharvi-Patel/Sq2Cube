import React, { useState } from "react";
import UploadSection from "../components/upload/UploadSection";
import PreviewPanel from "../components/upload/PreviewPanel";
import ProcessingSection from "../components/upload/ProcessingSection";
import ResultSection from "../components/upload/ResultSection";
import "./Upload.css";

// page states: "idle" | "processing" | "result"
const Upload = () => {
  const [stage, setStage]   = useState("idle");
  const [result, setResult] = useState(null);  // { urls, imageFile, textPrompt, selectedEffect }

  const handleProcessing = () => {
    setStage("processing");
  };

  const handleComplete = (data) => {
    setResult(data);
    setStage("result");
  };

  const handleError = () => setStage("idle");

  const handleBack = () => {
    setStage("idle");
    setResult(null);
  };

  return (
    <div className="upload-page">

      {/* We use display: contents so children remain direct flex items of .upload-page,
          but we can toggle display: none to hide them without unmounting,
          which preserves UploadSection's state if the API call fails. */}
      <div style={{ display: stage === "idle" ? "contents" : "none" }}>
        <UploadSection
          onProcessing={handleProcessing}
          onComplete={handleComplete}
          onError={handleError}
        />
        <PreviewPanel />
      </div>

      {/* PROCESSING — show animated steps while API call runs */}
      {stage === "processing" && (
        <ProcessingSection
          file={result?.imageFile ?? null}
          prompt={result?.textPrompt ?? ""}
          onComplete={() => {}}   // ProcessingSection auto-advances; real completion via onComplete above
        />
      )}

      {/* RESULT — show download links + 3D model URLs */}
      {stage === "result" && result && (
        <ResultSection
          urls={result.urls}
          imageFile={result.imageFile}
          prompt={result.textPrompt}
          effect={result.selectedEffect}
          onBack={handleBack}
        />
      )}

    </div>
  );
};

export default Upload;