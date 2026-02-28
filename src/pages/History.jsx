import React, { useEffect, useState } from "react";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("history")) || [];
    setHistory(stored);
  }, []);

  return (
    <div className="history-page">
      <h1>Conversion History</h1>

      {history.length === 0 ? (
        <p>No images generated yet.</p>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <img src={item.image} alt="Generated" />
              <p>{item.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;