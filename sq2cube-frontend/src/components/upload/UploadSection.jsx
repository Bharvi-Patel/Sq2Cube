
import { useState, useRef } from "react";
import { FiUpload, FiCamera, FiClipboard } from "react-icons/fi";
import { MdImage } from "react-icons/md";

const EFFECT_OPTIONS = [
  "3D Render",
  "Photorealistic",
  "Anime",
  "Cartoon",
  "Sketch",
  "Watercolor",
  "Oil Painting",
  "Clay Render",
  "Low Poly",
  "Pixel Art",
  "Vintage Film",
  "Black & White",
];

const UploadSection = () => {

  const [tab, setTab] = useState("image");
 
  const [uploadMode, setUploadMode] = useState("upload");

  const videoRef = useRef(null);

  const [textPrompt, setTextPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState("3D Render");
  const [showEffects, setShowEffects] = useState(false);

  
  /* FILE UPLOAD */
  const handleFile = (file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  /* WEBCAM */
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert("Camera access denied");
    }
  };

  /* CLIPBOARD */
  const pasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();

      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const url = URL.createObjectURL(blob);
            setImage(url);
          }
        }
      }
    } catch {
      alert("No image in clipboard");
    }
  };

  return (
    <div className="prompt-container">

      {/* PROMPT TABS */}
      <div className="tabs">
        <button
          className={tab === "image" ? "active" : ""}
          onClick={() => setTab("image")}
        >
          Image Prompt
        </button>

        <button
          className={tab === "text" ? "active" : ""}
          onClick={() => setTab("text")}
        >
          Text Prompt
        </button>
      </div>

      {/* IMAGE TAB */}
      {tab === "image" && (
        <div
          className="upload-box"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >

          <div className="upload-label">
            <MdImage size={14}/> Image
          </div>

          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            hidden
            onChange={handleInputChange}
          />

          <div className="upload-center">

            {/* UPLOAD MODE */}
            {uploadMode === "upload" && (
              <label htmlFor="imageUpload">
                {image ? (
                  <img src={image} alt="preview" className="preview-image"/>
                ) : (
                  <>
                    <FiUpload size={40}/>
                    <p>Drop Image Here</p>
                    <p>- or -</p>
                    <span className="upload-text">Click to Upload</span>
                  </>
                )}
              </label>
            )}

            {/* WEBCAM MODE */}
            {uploadMode === "webcam" && (
              <div className="webcam-box" onClick={startWebcam}>
                <FiCamera size={40}/>
                <p>Click to Access Webcam</p>
                <video ref={videoRef} autoPlay className="webcam-video"/>
              </div>
            )}

            {/* CLIPBOARD MODE */}
            {uploadMode === "clipboard" && (
              <div className="clipboard-box" onClick={pasteFromClipboard}>
                <FiClipboard size={40}/>
                <p>Paste from Clipboard</p>
              </div>
            )}

          </div>

          {/* TOOLBAR */}
          <div className="upload-toolbar">

            <FiUpload
              className={uploadMode === "upload" ? "active-icon" : ""}
              onClick={() => setUploadMode("upload")}
            />

            <FiCamera
              className={uploadMode === "webcam" ? "active-icon" : ""}
              onClick={() => setUploadMode("webcam")}
            />

            <FiClipboard
              className={uploadMode === "clipboard" ? "active-icon" : ""}
              onClick={() => setUploadMode("clipboard")}
            />

          </div>

        </div>
      )}

      {/* TEXT TAB */}
      {tab === "text" && (
        <div className="text-box">
          <textarea
            placeholder="Describe the shape you want to generate..."
            value={textPrompt}
            onChange={(e)=>setTextPrompt(e.target.value)}
          />
        </div>
      )}

      {/* EFFECT PICKER */}
      <div className="effect-picker">
        <button
          type="button"
          className="effect-trigger"
          onClick={() => setShowEffects((prev) => !prev)}
        >
          <span className="effect-trigger-label">Style Filter</span>
          <span className="effect-trigger-value">{selectedEffect}</span>
          <span className={`effect-chevron ${showEffects ? "open" : ""}`}>▾</span>
        </button>

        {showEffects && (
          <div className="effect-dropdown">
            {EFFECT_OPTIONS.map((effect) => (
              <button
                key={effect}
                type="button"
                className={`effect-option ${selectedEffect === effect ? "active" : ""}`}
                onClick={() => {
                  setSelectedEffect(effect);
                  setShowEffects(false);
                }}
              >
                {effect}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GENERATE BUTTON */}
      <button className="gen-btn">Gen Shape</button>

      
 

    </div>
  );
};

export default UploadSection;
