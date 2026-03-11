import { useState } from "react";

const PreviewPanel = () => {
  const [tab, setTab] = useState("generated");

  return (
    <div className="preview-panel">

      {/* Tabs */}
      <div className="preview-tabs">
        <span
          className={tab === "generated" ? "active" : ""}
          onClick={() => setTab("generated")}
        >
          Generated Mesh
        </span>

        <span
          className={tab === "export" ? "active" : ""}
          onClick={() => setTab("export")}
        >
          Exporting Mesh
        </span>

        <span
          className={tab === "stats" ? "active" : ""}
          onClick={() => setTab("stats")}
        >
          Mesh Statistic
        </span>
      </div>

      {/* SAME BOX */}
      <div className="preview-box">

        {tab === "generated" && (
          <div className="preview-content">
            
            <p>No mesh generated yet.</p>
          </div>
        )}

        {tab === "export" && (
          <div className="preview-content">
            <p>Export your mesh here</p>
            <button className="export-btn">Download .OBJ</button>
            <button className="export-btn">Download .GLB</button>
          </div>
        )}

        {tab === "stats" && (
          <div className="preview-content">
            <p>Mesh Statistics</p>
            <p>Vertices: 0</p>
            <p>Faces: 0</p>
            <p>Triangles: 0</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PreviewPanel;