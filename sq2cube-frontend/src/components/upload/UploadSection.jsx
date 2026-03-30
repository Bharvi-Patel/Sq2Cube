import { useState, useRef } from "react";
import { FiUpload, FiCamera, FiClipboard } from "react-icons/fi";
import { MdImage } from "react-icons/md";
import { convertSingleImage, convertTextPrompt } from "../../services/Meshyapi";

// Map your UI style labels → Meshy texture prompt hints
const EFFECT_TO_PROMPT = {
  "3D Render":     "clean 3D render, smooth surfaces",
  "Photorealistic":"photorealistic, detailed textures, realistic lighting",
  "Anime":         "anime style, cel shaded, vibrant colors",
  "Cartoon":       "cartoon style, bold outlines, flat colors",
  "Sketch":        "pencil sketch style, hand drawn",
  "Watercolor":    "watercolor painting style, soft edges",
  "Oil Painting":  "oil painting style, thick brush strokes",
  "Clay Render":   "clay render, matte surface, pastel tones",
  "Low Poly":      "low poly style, geometric, flat shading",
  "Pixel Art":     "pixel art style, 8-bit, blocky",
  "Vintage Film":  "vintage film style, desaturated, grainy",
  "Black & White": "black and white, monochrome, high contrast",
};

const EFFECT_OPTIONS = Object.keys(EFFECT_TO_PROMPT);

const UploadSection = ({ onProcessing, onComplete, onError }) => {
  const [tab, setTab]               = useState("image");
  const [uploadMode, setUploadMode] = useState("upload");
  const videoRef                    = useRef(null);

  const [textPrompt, setTextPrompt]       = useState("");
  const [image, setImage]                 = useState(null);   // preview URL
  const [imageFile, setImageFile]         = useState(null);   // raw File object
  const [selectedEffect, setSelectedEffect] = useState("3D Render");
  const [showEffects, setShowEffects]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  // ── File handling ────────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
    setError("");
  };

  const handleDrop        = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver    = (e) => e.preventDefault();
  const handleInputChange = (e) => handleFile(e.target.files[0]);

  // ── Webcam ───────────────────────────────────────────────────────────────
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Camera access denied.");
    }
  };

  // ── Clipboard ────────────────────────────────────────────────────────────
  const pasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "clipboard.png", { type });
            handleFile(file);
            return;
          }
        }
      }
      setError("No image found in clipboard.");
    } catch {
      setError("Could not read clipboard.");
    }
  };

  // ── GENERATE ─────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setError("");

    // Validation
    if (tab === "image" && !imageFile) {
      setError("Please upload an image first.");
      return;
    }
    if (tab === "text" && !textPrompt.trim()) {
      setError("Please enter a text prompt.");
      return;
    }

    setLoading(true);
    onProcessing?.();   // tell parent to show ProcessingSection

    try {
      let urls;

      if (tab === "image") {
        const textureHint = EFFECT_TO_PROMPT[selectedEffect] ?? "";
        urls = await convertSingleImage(imageFile, textureHint);
      } else {
        const fullPrompt = `${textPrompt}, ${EFFECT_TO_PROMPT[selectedEffect] ?? ""}`.trim();
        urls = await convertTextPrompt(fullPrompt);
      }

      // Pass result up to parent (Upload.jsx)
      onComplete?.({ urls, imageFile, textPrompt, selectedEffect });
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prompt-container">

      {/* TABS */}
      <div className="tabs">
        <button className={tab === "image" ? "active" : ""} onClick={() => setTab("image")}>
          Image Prompt
        </button>
        <button className={tab === "text" ? "active" : ""} onClick={() => setTab("text")}>
          Text Prompt
        </button>
      </div>

      {/* IMAGE TAB */}
      {tab === "image" && (
        <div className="upload-box" onDrop={handleDrop} onDragOver={handleDragOver}>
          <div className="upload-label"><MdImage size={14}/> Image</div>

          <input type="file" accept="image/*" id="imageUpload" hidden onChange={handleInputChange}/>

          <div className="upload-center">
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

            {uploadMode === "webcam" && (
              <div className="webcam-box" onClick={startWebcam}>
                <FiCamera size={40}/>
                <p>Click to Access Webcam</p>
                <video ref={videoRef} autoPlay className="webcam-video"/>
              </div>
            )}

            {uploadMode === "clipboard" && (
              <div className="clipboard-box" onClick={pasteFromClipboard}>
                <FiClipboard size={40}/>
                <p>Paste from Clipboard</p>
                {image && <img src={image} alt="clipboard preview" className="preview-image"/>}
              </div>
            )}
          </div>

          <div className="upload-toolbar">
            <FiUpload   className={uploadMode === "upload"    ? "active-icon" : ""} onClick={() => setUploadMode("upload")}/>
            <FiCamera   className={uploadMode === "webcam"    ? "active-icon" : ""} onClick={() => setUploadMode("webcam")}/>
            <FiClipboard className={uploadMode === "clipboard" ? "active-icon" : ""} onClick={() => setUploadMode("clipboard")}/>
          </div>
        </div>
      )}

      {/* TEXT TAB */}
      {tab === "text" && (
        <div className="text-box">
          <textarea
            placeholder="Describe the shape you want to generate..."
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
          />
        </div>
      )}

      {/* EFFECT PICKER (Only available for Text Prompts) */}
      {tab === "text" && (
        <div className="effect-picker">
          <button type="button" className="effect-trigger" onClick={() => setShowEffects((p) => !p)}>
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
                  onClick={() => { setSelectedEffect(effect); setShowEffects(false); }}
                >
                  {effect}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ERROR */}
      {error && <p className="upload-error" style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px" }}>{error}</p>}

      {/* GENERATE BUTTON */}
      <button className="gen-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Gen Shape"}
      </button>

    </div>
  );
};

export default UploadSection;