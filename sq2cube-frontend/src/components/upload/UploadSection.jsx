import { useState, useRef } from "react";
import { FiUpload, FiCamera, FiClipboard } from "react-icons/fi";
import { MdImage } from "react-icons/md";
import { convertSingleImage, convertMultiImage, convertTextPrompt } from "../../services/Meshyapi";

// const EFFECT_TO_PROMPT = {
//   "3D Render":      "clean 3D render, smooth surfaces",
//   "Photorealistic": "photorealistic, detailed textures, realistic lighting",
//   "Anime":          "anime style, cel shaded, vibrant colors",
//   "Cartoon":        "cartoon style, bold outlines, flat colors",
//   "Sketch":         "pencil sketch style, hand drawn",
//   "Watercolor":     "watercolor painting style, soft edges",
//   "Oil Painting":   "oil painting style, thick brush strokes",
//   "Clay Render":    "clay render, matte surface, pastel tones",
//   "Low Poly":       "low poly style, geometric, flat shading",
//   "Pixel Art":      "pixel art style, 8-bit, blocky",
//   "Vintage Film":   "vintage film style, desaturated, grainy",
//   "Black & White":  "black and white, monochrome, high contrast",
// };

// const EFFECT_OPTIONS = Object.keys(EFFECT_TO_PROMPT);

const UploadSection = ({ onProcessing, onComplete, onError }) => {
  const [tab, setTab]                   = useState("image");
  const [uploadMode, setUploadMode]     = useState("upload");
  const videoRef                        = useRef(null);

  // Single image
  const [image, setImage]               = useState(null);
  const [imageFile, setImageFile]       = useState(null);

  // Multi image
  const [multiImages, setMultiImages]   = useState([]); // [{file, preview}]

  // Text
  const [textPrompt, setTextPrompt]     = useState("");

  const [selectedEffect, setSelectedEffect] = useState("3D Render");
  const [showEffects, setShowEffects]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  // ── Single image ─────────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
    setError("");
  };

  const handleDrop        = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver    = (e) => e.preventDefault();
  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const clearSingleImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImage(null);
    setImageFile(null);
    document.getElementById("imageUpload").value = "";
  };

  // ── Multi image ───────────────────────────────────────────────────────────
  const handleMultiFiles = (files) => {
    const arr = Array.from(files);
    const remaining = 4 - multiImages.length;
    const toAdd = arr.slice(0, remaining).map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setMultiImages(prev => [...prev, ...toAdd]);
    setError("");
  };

  const removeMultiImage = (index) => {
    setMultiImages(prev => prev.filter((_, i) => i !== index));
  };

  // ── Webcam ────────────────────────────────────────────────────────────────
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Camera access denied.");
    }
  };

  // ── Clipboard ─────────────────────────────────────────────────────────────
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

  // ── GENERATE ──────────────────────────────────────────────────────────────
 const handleGenerate = async () => {
  setError("");

  if (tab === "image" && !imageFile) {
    setError("Please upload an image first.");
    return;
  }
  if (tab === "multi" && multiImages.length < 1) {
    setError("Please upload at least 1 image.");
    return;
  }
  if (tab === "multi" && multiImages.length > 4) {
    setError("Maximum 4 images allowed.");
    return;
  }
  if (tab === "text" && !textPrompt.trim()) {
    setError("Please enter a text prompt.");
    return;
  }

  setLoading(true);
  onProcessing?.();

  try {
    let urls;

    if (tab === "image") {
      urls = await convertSingleImage(imageFile, "");  // no texture hint
    } else if (tab === "multi") {
      const files = multiImages.filter(m => m !== null).map(m => m.file);
      urls = await convertMultiImage(files);
    } else {
      urls = await convertTextPrompt(textPrompt.trim());  // just the raw prompt
    }

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
          Image
        </button>
        <button className={tab === "multi" ? "active" : ""} onClick={() => setTab("multi")}>
          Multi Image
        </button>
        <button className={tab === "text" ? "active" : ""} onClick={() => setTab("text")}>
          Text Prompt
        </button>
      </div>

      {/* ── SINGLE IMAGE TAB ── */}
      {tab === "image" && (
        <div className="upload-box" onDrop={handleDrop} onDragOver={handleDragOver}>
          <div className="upload-label"><MdImage size={14} /> Image</div>
          <input type="file" accept="image/*" id="imageUpload" hidden onChange={handleInputChange} />

          <div className="upload-center">
            {image ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={image} alt="preview" className="preview-image" />
                <button
                  onClick={clearSingleImage}
                  style={{
                    position: "absolute", top: "-8px", right: "-8px",
                    width: "22px", height: "22px", borderRadius: "50%",
                    border: "none", background: "#ef4444", color: "white",
                    fontSize: "13px", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", zIndex: 10,
                  }}
                >✕</button>
              </div>
            ) : (
              <label htmlFor="imageUpload" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <FiUpload size={40} />
                <p>Drop Image Here</p>
                <p>- or -</p>
                <span className="upload-text">Click to Upload</span>
              </label>
            )}
          </div>

          <div className="upload-toolbar">
            <FiUpload    className={uploadMode === "upload"    ? "active-icon" : ""} onClick={() => setUploadMode("upload")} />
            <FiCamera    className={uploadMode === "webcam"    ? "active-icon" : ""} onClick={() => setUploadMode("webcam")} />
            <FiClipboard className={uploadMode === "clipboard" ? "active-icon" : ""} onClick={() => setUploadMode("clipboard")} />
          </div>
        </div>
      )}

      {/* ── MULTI IMAGE TAB ── */}
{tab === "multi" && (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    
    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
      Front is required. Back, Left, Right are optional but improve quality.
    </p>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {["Front", "Back", "Left", "Right"].map((label, i) => {
        const isRequired = i === 0;
        const entry = multiImages[i] ?? null;

        return (
          <div key={label} style={{
            background: "#1e293b",
            border: `1px dashed ${entry ? "rgba(255,122,0,0.5)" : "rgba(255,255,255,0.15)"}`,
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative",
            aspectRatio: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}>

            {/* Label badge */}
            <div style={{
              position: "absolute", top: "6px", left: "6px",
              background: isRequired ? "rgba(255,122,0,0.8)" : "rgba(255,255,255,0.15)",
              borderRadius: "4px", fontSize: "10px", fontWeight: 600,
              padding: "2px 7px", color: "white", zIndex: 2,
            }}>
              {label}{isRequired ? " *" : ""}
            </div>

            {/* Remove button */}
            {entry && (
              <button
                onClick={() => {
                  setMultiImages(prev => {
                    const updated = [...prev];
                    updated[i] = null;
                    return updated;
                  });
                }}
                style={{
                  position: "absolute", top: "4px", right: "4px",
                  width: "20px", height: "20px", borderRadius: "50%",
                  border: "none", background: "#ef4444", color: "white",
                  fontSize: "12px", cursor: "pointer", zIndex: 3,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            )}

            {/* Content */}
            {entry ? (
              <img
                src={entry.preview}
                alt={label}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "6px", cursor: "pointer", color: "rgba(255,255,255,0.4)",
                fontSize: "12px", padding: "10px", textAlign: "center",
              }}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setMultiImages(prev => {
                      const updated = [...prev];
                      updated[i] = { file, preview: URL.createObjectURL(file) };
                      return updated;
                    });
                    e.target.value = "";
                  }}
                />
                <FiUpload size={24} />
                <span>Upload {label}</span>
              </label>
            )}

          </div>
        );
      })}
    </div>

  </div>
)}

      {/* ── TEXT TAB ── */}
      {tab === "text" && (
        <div className="text-box">
          <textarea
            placeholder="Describe the shape you want to generate..."
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
          />
        </div>
      )}

      {/* EFFECT PICKER — text and single image only
      {(tab === "text" || tab === "image") && (
        <div className="effect-picker">
          <button type="button" className="effect-trigger" onClick={() => setShowEffects(p => !p)}>
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
      )} */}

      {/* ERROR */}
      {error && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px" }}>{error}</p>}

      {/* GENERATE BUTTON */}
      <button className="gen-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Gen Shape"}
      </button>

    </div>
  );
};

export default UploadSection;