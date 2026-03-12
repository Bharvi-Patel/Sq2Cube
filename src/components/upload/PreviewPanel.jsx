import { useState } from "react";
import {
  Box,
  Circle,
  SlidersHorizontal,
  Palette,
  Download,
  Star,
  Share2,
  Sparkles,
  Printer
} from "lucide-react";

const PreviewPanel = () => {
  const [tab, setTab] = useState("generated");

  return (
    <div className="preview-panel">

      {/* Title */}
      <h3 className="preview-title">Generate Mesh Here</h3>

      {/* Preview Box */}
      <div className="preview-box">
        {tab === "generated" && (
          <div className="preview-content">
            <p>No mesh generated yet.</p>
          </div>
        )}
      </div>

      {/* TOOLBAR 1 */}
      <div className="toolbar-main">
        <Box size={18}/>
        
        <SlidersHorizontal size={18}/>
        <div className="color purple"></div>
        <div className="color orange"></div>
        <div className="color gray"></div>
        <div className="color cyan"></div>
      </div>

      {/* TOOLBAR 2 */}
      <div className="toolbar-actions">

        <div className="left-actions">
          <button className="workspace-btn">
            <Sparkles size={16}/> Edit in Workspace
          </button>

          
        </div>

        <div className="right-actions">
          <Star size={18}/>
          <Share2 size={18}/>
         

          <button className="export-btn">
            <Download size={16}/> Export
          </button>
        </div>

      </div>

    </div>
  );
};

export default PreviewPanel;