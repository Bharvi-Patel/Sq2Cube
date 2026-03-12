import React from "react";

const ResultSection = ({ file, prompt, onBack }) => {
  const imageURL = URL.createObjectURL(file);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "sq2cube-3d-model.png";
    link.click();
  };

  return (
    <div className="result-layout">

      {/* LEFT SIDE - RESULT PREVIEW */}
      <div className="result-preview">
        <img
          src={imageURL}
          alt="Generated 3D Model"
          className="result-image"
        />
      </div>

      {/* RIGHT SIDE - RESULT INFO */}
      <div className="result-panel">
        <h2>3D Model Generated Successfully!!!</h2>

        {prompt && (
          <div className="result-prompt">
            <span>Prompt Used:</span>
            <p>{prompt}</p>
          </div>
        )}

        <div className="result-buttons">
          <button className="download-btn" onClick={handleDownload}>
            Download Model
          </button>

          <button className="back-btn" onClick={onBack}>
            Generate Another
          </button>
        </div>
      </div>

    </div>
  );
};

export default ResultSection;