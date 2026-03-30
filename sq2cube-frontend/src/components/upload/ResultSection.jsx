import React from "react";
import { Download } from "lucide-react";

const ResultSection = ({ urls, imageFile, prompt, effect, onBack }) => {
  // urls = { glb: "https://...", obj: "https://...", thumbnail: "https://..." }
  const previewSrc = urls?.thumbnail ?? (imageFile ? URL.createObjectURL(imageFile) : null);

  const downloadFile = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="result-layout">

      {/* LEFT — thumbnail preview */}
      <div className="result-preview">
        {previewSrc ? (
          <img src={previewSrc} alt="3D Model Thumbnail" className="result-image"/>
        ) : (
          <div className="result-placeholder">No preview available</div>
        )}
      </div>

      {/* RIGHT — info + downloads */}
      <div className="result-panel">
        <h2>3D Model Generated Successfully!</h2>

        {effect && (
          <div className="result-prompt">
            <span>Style:</span>
            <p>{effect}</p>
          </div>
        )}

        {prompt && (
          <div className="result-prompt">
            <span>Prompt Used:</span>
            <p>{prompt}</p>
          </div>
        )}

        {/* DOWNLOAD BUTTONS */}
        <div className="result-buttons">

          {urls?.glb && (
            <button
              className="download-btn"
              onClick={() => downloadFile(urls.glb, "model.glb")}
            >
              <Download size={15}/> Download GLB
            </button>
          )}

          {urls?.obj && (
            <button
              className="download-btn"
              onClick={() => downloadFile(urls.obj, "model.obj")}
            >
              <Download size={15}/> Download OBJ
            </button>
          )}

          <button className="back-btn" onClick={onBack}>
            Generate Another
          </button>

        </div>
      </div>

    </div>
  );
};

export default ResultSection;