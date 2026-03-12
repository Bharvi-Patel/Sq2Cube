import React, { useEffect, useState } from "react";
import "./History.css";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(storedHistory);
  }, []);

  const deleteItem = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  return (
    <div className="history-page">
      <h1>Conversion History</h1>

      {history.length === 0 ? (
        <p className="empty-history">No images generated yet.</p>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              
              <img
                src={item.image}
                alt="Generated result"
                className="history-image"
              />

              <div className="history-info">
                <p className="history-date">{item.date}</p>

                <div className="history-actions">
                  <a
                    href={item.image}
                    download
                    className="download-btn"
                  >
                    Download
                  </a>

                  <button
                    className="delete-btn"
                    onClick={() => deleteItem(item.id)}
                  >
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