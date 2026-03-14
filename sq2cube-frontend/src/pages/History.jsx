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

  if (loading) return <div className="history-page"><p>Loading...</p></div>;
  if (error)   return <div className="history-page"><p style={{color:"#ef4444"}}>{error}</p></div>;

  return (
    <div className="history-page">
      <h1>Your Generation History</h1>

      {history.length === 0 ? (
        <p className="empty-history">No images generated yet.</p>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <img src={item.image} alt="result" className="history-image" />
              <div className="history-info">
                {item.prompt && <p style={{fontSize:"12px",opacity:0.8,marginBottom:"6px"}}>{item.prompt}</p>}
                <p className="history-date">{item.date}</p>
                <div className="history-actions">
                  <a href={item.image} download className="download-btn">Download</a>
                  <button className="delete-btn" onClick={() => deleteItem(item.id)}>Delete</button>
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