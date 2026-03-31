import React, { useEffect, useState } from "react";
import "./History.css";
import { api } from "../services/api";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api("/history")
      .then(setHistory)
      .catch(() => setError("Could not load history."))
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

  const isGlb = (url) => url && (url.endsWith(".glb") || url.includes(".glb") || url.includes("fal.media") || url.includes("fal.run"));

  if (loading) return <div className="history-page"><p>Loading...</p></div>;
  if (error)   return <div className="history-page"><p style={{color:"#ef4444"}}>{error}</p></div>;

  return (
    <div className="history-page">
      <h1>Your Generation History</h1>

      {history.length === 0 ? (
        <p className="empty-history">No models generated yet.</p>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-card">

              {/* 3D Model Preview */}
              {item.image && isGlb(item.image) ? (
                <div style={{
                  width: "100%", height: "180px",
                  background: "#0d1117", borderRadius: "8px 8px 0 0",
                  overflow: "hidden", position: "relative"
                }}>
                  <model-viewer
                    src={item.image}
                    alt="3D model"
                    auto-rotate
                    camera-controls
                    interaction-prompt="none"
                    shadow-intensity="0.5"
                    style={{ width: "100%", height: "100%", background: "transparent" }}
                  />
                </div>
              ) : item.image ? (
                <img src={item.image} alt="result" className="history-image" />
              ) : (
                <div style={{
                  width: "100%", height: "180px", background: "#111",
                  borderRadius: "8px 8px 0 0", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.3)", fontSize: "13px"
                }}>
                  {item.status === "failed" ? "❌ Generation Failed" : "No preview"}
                </div>
              )}

              <div className="history-info">
                {item.prompt && (
                  <p style={{ fontSize: "12px", opacity: 0.8, marginBottom: "6px", 
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.prompt}
                  </p>
                )}
                <p className="history-date">{item.date}</p>
                <div className="history-actions">
                  {item.image && (
                    <a href={item.image} download="model.glb" className="download-btn">
                      Download GLB
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