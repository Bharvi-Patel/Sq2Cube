import { Box, SlidersHorizontal, Download, Share2, Pause, Play } from "lucide-react";
import { useState, useRef } from "react";

const PreviewPanel = ({ glbUrl, loading }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeColor, setActiveColor] = useState(null);
  const mvRef = useRef(null);

  const colors = [
    { cls: "purple", value: "#8b5cf6" },
    { cls: "orange", value: "#ff7a00" },
    { cls: "gray",   value: "#6b7280" },
    { cls: "cyan",   value: "#06b6d4" },
  ];

const togglePlayPause = () => {
  const mv = document.querySelector("model-viewer");
  if (!mv) return;
  mv.autoRotate = !mv.autoRotate;
  setIsPlaying(!isPlaying);
};

  const applyColor = (color) => {
    const mv = mvRef.current || document.querySelector("model-viewer");
    if (!mv) return;
    setActiveColor(color.value);

    // Apply color tint via model-viewer's CSS filter
    mv.style.filter = `
      drop-shadow(0 0 12px ${color.value}99)
      hue-rotate(${getHueRotate(color.value)}deg)
      saturate(1.5)
    `;
  };

  const getHueRotate = (hex) => {
    const map = {
      "#8b5cf6": 260,  // purple
      "#ff7a00": 20,   // orange
      "#6b7280": 0,    // gray — no rotation
      "#06b6d4": 185,  // cyan
    };
    return map[hex] ?? 0;
  };

  const resetColor = () => {
    const mv = mvRef.current || document.querySelector("model-viewer");
    if (!mv) return;
    mv.style.filter = "none";
    setActiveColor(null);
  };

  return (
    <div className="preview-panel">

      <h3 className="preview-title">Generate Mesh Here</h3>

      {/* 3D VIEWER BOX */}
      <div className="preview-box">
        {loading ? (
          <div className="preview-content">
            <div className="spinner" style={{ margin: "0 auto 12px" }} />
            <p>Generating your 3D model...</p>
            <p style={{ fontSize: "12px", marginTop: "6px", opacity: 0.5 }}>
              This may take 30–60 seconds
            </p>
          </div>
        ) : glbUrl ? (
          <model-viewer
            ref={mvRef}
            src={glbUrl}
            alt="3D model"
            auto-rotate
            auto-rotate-delay="0"
            rotation-per-second="30deg"
            camera-controls
            touch-action="pan-y"
            interaction-prompt="none"
            shadow-intensity="1"
            exposure="1"
            camera-orbit="90deg 85deg 105%"
            min-camera-orbit="auto 0deg auto"
            max-camera-orbit="auto 180deg auto"
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
              borderRadius: "10px",
            }}
          />
        ) : (
          <div className="preview-content">
            <p>No mesh generated yet.</p>
            <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.5 }}>
              Upload an image and click Gen Shape
            </p>
          </div>
        )}
      </div>

      {/* TOOLBAR — single row */}
      <div className="toolbar-main" style={{ width: "100%", justifyContent: "space-between", borderRadius: "12px", padding: "10px 16px" }}>

        {/* Left: controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

          {/* Reset camera */}
          <Box
            size={18}
            style={{ cursor: "pointer", opacity: 0.7 }}
            title="Reset view"
            onClick={() => {
              const mv = document.querySelector("model-viewer");
              if (mv) mv.cameraOrbit = "0deg 75deg 105%";
            }}
          />

          {/* Pause / Play */}
          {isPlaying ? (
            <Pause
              size={18}
              style={{ cursor: "pointer", opacity: 0.7 }}
              title="Pause rotation"
              onClick={togglePlayPause}
            />
          ) : (
            <Play
              size={18}
              style={{ cursor: "pointer", opacity: 0.7 }}
              title="Play rotation"
              onClick={togglePlayPause}
            />
          )}

          {/* Divider */}
          <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.15)" }} />

          {/* Color tint dots */}
          {colors.map((c) => (
            <div
              key={c.cls}
              className={`color ${c.cls}`}
              title={`Apply ${c.cls} tint`}
              onClick={() => activeColor === c.value ? resetColor() : applyColor(c)}
              style={{
                outline: activeColor === c.value ? "2px solid white" : "none",
                outlineOffset: "2px",
                cursor: "pointer",
              }}
            />
          ))}

          {/* Reset color */}
          {activeColor && (
            <span
              onClick={resetColor}
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              title="Reset color"
            >
              ✕
            </span>
          )}
        </div>

        {/* Right: share + export */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {/* Share */}
          <Share2
            size={18}
            style={{ cursor: "pointer", opacity: 0.7 }}
            title="Copy model URL"
            onClick={() => {
              if (glbUrl) {
                navigator.clipboard.writeText(glbUrl);
                alert("Model URL copied to clipboard!");
              }
            }}
          />

          {/* Export */}
          {glbUrl ? (
            <a href={glbUrl} download="model.glb" style={{ textDecoration: "none" }}>
              <button className="export-btn">
                <Download size={16} /> Export GLB
              </button>
            </a>
          ) : (
            <button className="export-btn" style={{ opacity: 0.5, cursor: "not-allowed" }}>
              <Download size={16} /> Export
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

export default PreviewPanel;