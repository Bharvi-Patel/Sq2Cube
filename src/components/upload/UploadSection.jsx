import React, { useState } from "react";
import ProcessingSection from "./ProcessingSection";
import ResultSection from "./ResultSection";

const UploadSection = () => {
  const [file, setFile] = useState(null);
const [stage, setStage] = useState("upload");
  const [prompt, setPrompt] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    setStage("processing");

    // Simulate API call

  };

  return (
  <section className="upload-section">
    <div className="upload-card">

      {stage === "upload" && (
        <>
          <h1>Convert Image to 3D</h1>

          <form onSubmit={handleSubmit}>
            <label className="drop-area">
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />

              <p className="upload-main">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>

              <span className="upload-sub">
                PNG, JPG up to 10MB
              </span>
            </label>

            <p className="upload-description">
              Upload an image and generate a 3D model.
            </p>

            <div className="prompt-container">
              <label className="prompt-label">Enter Prompt</label>
              <textarea
                className="prompt-box"
                placeholder="Describe how you want the 3D model to look..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <button className="convert-btn" type="submit">
              Convert to 3D
            </button>
          </form>
        </>
      )}

      {stage === "processing" && (
        <ProcessingSection
          file={file}
          prompt={prompt}
          onComplete={() => setStage("result")}
        />
      )}

      {stage === "result" && (
        <ResultSection
          file={file}
          prompt={prompt}
          onBack={() => setStage("upload")}
        />
      )}

    </div>
  </section>
);
};

export default UploadSection;