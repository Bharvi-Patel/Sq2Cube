import React, { useEffect, useRef, useState } from "react";
import "./History.css";
import { api } from "../services/api";

// ── Model Viewer wrapper to avoid JSX custom element issues ──
const ModelViewer = ({ src, alt }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    const mv = document.createElement("model-viewer");
    mv.setAttribute("src", src);
    mv.setAttribute("alt", alt || "3D model");
    mv.setAttribute("auto-rotate", "");
    mv.setAttribute("camera-controls", "");
    mv.setAttribute("interaction-prompt", "none");
    mv.setAttribute("shadow-intensity", "0.8");
    mv.setAttribute("exposure", "1");
    mv.style.width = "100%";
    mv.style.height = "100%";
    mv.style.background = "transparent";
    el.appendChild(mv);
    return () => { el.innerHTML = ""; };
  }, [src]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%", height: "200px",
        background: "#0d1117", borderRadius: "12px 12px 0 0",
        overflow: "hidden"
      }}
    />
  );
};

// ── Main History Component ──
const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api("/history")
      .then((data) => {
        console.log("History data:", data);
        setHistory(data);
      })
      .catch((err) => {
        console.error("History error:", err);
        setError(err.message || "Could not load history.");
      })
      .finally(() => setLoading(false));
  }, []);

  const deleteItem = async (entryId) => {
    try {
      await api(`/history/${entryId}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((item) => item.id !== entryId));
    } catch {
      alert("Failed to delete.");
    }
  };

  const isGlb = (url) =>
    url && (
      url.endsWith(".glb") ||
      url.includes(".glb") ||
      url.includes("fal.media") ||
      url.includes("fal.run")
    );

  if (loading) return (
    <div className="history-page">
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", flexDirection: "column", gap: "16px"
      }}>
        <div className="spinner" />
        <p style={{ opacity: 0.5 }}>Loading your models...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="history-page">
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", flexDirection: "column", gap: "12px"
      }}>
        <span style={{ fontSize: "40px" }}>⚠️</span>
        <p style={{ color: "#ef4444", fontSize: "15px" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 20px", borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent", color: "white", cursor: "pointer"
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="history-page">
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "28px", flexWrap: "wrap", gap: "12px"
      }}>
        <h1 style={{ margin: 0 }}>Your Generation History</h1>
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          {history.length} model{history.length !== 1 ? "s" : ""}
        </span>
      </div>

      {history.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "50vh", gap: "16px",
          color: "rgba(255,255,255,0.3)"
        }}>
          <span style={{ fontSize: "56px" }}>🧊</span>
          <p style={{ fontSize: "18px", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
            No models yet
          </p>
          <p style={{ fontSize: "14px" }}>
            Go to the{" "}
            <a href="/upload" style={{ color: "#ff7a00" }}>Upload page</a>
            {" "}to generate your first 3D model.
          </p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-card">

              {/* Preview */}
              {item.image && isGlb(item.image) ? (
                <ModelViewer src={item.image} alt={item.prompt || "3D model"} />
              ) : item.thumbnail ? (
                <img src={item.thumbnail} alt="thumbnail" className="history-image" />
              ) : item.image ? (
                <img src={item.image} alt="result" className="history-image" />
              ) : (
                <div style={{
                  width: "100%", height: "200px", background: "#111",
                  borderRadius: "12px 12px 0 0", display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.3)", gap: "8px"
                }}>
                  <span style={{ fontSize: "32px" }}>🧊</span>
                  <span style={{ fontSize: "12px" }}>No preview</span>
                </div>
              )}

              <div className="history-info">
                {item.prompt && (
                  <p style={{
                    fontSize: "12px", opacity: 0.75, marginBottom: "6px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    {item.prompt}
                  </p>
                )}

                <p className="history-date">{item.date}</p>

                <div className="history-actions">
                  {item.image && isGlb(item.image) && (
                    <a href={item.image} download="model.glb" className="download-btn">
                      ⬇ GLB
                    </a>
                  )}
                  <button className="delete-btn" onClick={() => deleteItem(item.id)}>
                    Delete
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;