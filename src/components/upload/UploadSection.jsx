
import { useState, useRef } from "react";
import { FiUpload, FiCamera, FiClipboard } from "react-icons/fi";
import { MdImage } from "react-icons/md";

const UploadSection = () => {

  const [tab, setTab] = useState("image");
  const [panelTab, setPanelTab] = useState("advanced");
  const [uploadMode, setUploadMode] = useState("upload");

  const videoRef = useRef(null);

  const [textPrompt, setTextPrompt] = useState("");
  const [image, setImage] = useState(null);

  const [fileType, setFileType] = useState("glb");
  const [targetFaces, setTargetFaces] = useState(10000);
  const [simplifyMesh, setSimplifyMesh] = useState(false);

  const [removeBg, setRemoveBg] = useState(true);
  const [randomSeed, setRandomSeed] = useState(true);

  const [seed, setSeed] = useState(1234);
  const [steps, setSteps] = useState(30);
  const [resolution, setResolution] = useState(256);

  const [guidance, setGuidance] = useState(5);
  const [chunks, setChunks] = useState(8000);

  /* FILE UPLOAD */
  const handleFile = (file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  /* WEBCAM */
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert("Camera access denied");
    }
  };

  /* CLIPBOARD */
  const pasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();

      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const url = URL.createObjectURL(blob);
            setImage(url);
          }
        }
      }
    } catch {
      alert("No image in clipboard");
    }
  };

  return (
    <div className="prompt-container">

      {/* PROMPT TABS */}
      <div className="tabs">
        <button
          className={tab === "image" ? "active" : ""}
          onClick={() => setTab("image")}
        >
          Image Prompt
        </button>

        <button
          className={tab === "text" ? "active" : ""}
          onClick={() => setTab("text")}
        >
          Text Prompt
        </button>
      </div>

      {/* IMAGE TAB */}
      {tab === "image" && (
        <div
          className="upload-box"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >

          <div className="upload-label">
            <MdImage size={14}/> Image
          </div>

          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            hidden
            onChange={handleInputChange}
          />

          <div className="upload-center">

            {/* UPLOAD MODE */}
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

            {/* WEBCAM MODE */}
            {uploadMode === "webcam" && (
              <div className="webcam-box" onClick={startWebcam}>
                <FiCamera size={40}/>
                <p>Click to Access Webcam</p>
                <video ref={videoRef} autoPlay className="webcam-video"/>
              </div>
            )}

            {/* CLIPBOARD MODE */}
            {uploadMode === "clipboard" && (
              <div className="clipboard-box" onClick={pasteFromClipboard}>
                <FiClipboard size={40}/>
                <p>Paste from Clipboard</p>
              </div>
            )}

          </div>

          {/* TOOLBAR */}
          <div className="upload-toolbar">

            <FiUpload
              className={uploadMode === "upload" ? "active-icon" : ""}
              onClick={() => setUploadMode("upload")}
            />

            <FiCamera
              className={uploadMode === "webcam" ? "active-icon" : ""}
              onClick={() => setUploadMode("webcam")}
            />

            <FiClipboard
              className={uploadMode === "clipboard" ? "active-icon" : ""}
              onClick={() => setUploadMode("clipboard")}
            />

          </div>

        </div>
      )}

      {/* TEXT TAB */}
      {tab === "text" && (
        <div className="text-box">
          <textarea
            placeholder="Describe the shape you want to generate..."
            value={textPrompt}
            onChange={(e)=>setTextPrompt(e.target.value)}
          />
        </div>
      )}

      {/* GENERATE BUTTON */}
      <button className="gen-btn">Gen Shape</button>

      {/* OPTIONS PANEL */}
      <div className="export-container">

        <div className="export-tabs">
          <button
            className={panelTab === "advanced" ? "tab active" : "tab"}
            onClick={()=>setPanelTab("advanced")}
          >
            Advanced Options
          </button>

          <button
            className={panelTab === "export" ? "tab active" : "tab"}
            onClick={()=>setPanelTab("export")}
          >
            Export
          </button>
        </div>

        {/* ADVANCED */}
        {panelTab === "advanced" && (
          <div className="export-box">

            <div className="export-row">
              <label>
                <input
                  type="checkbox"
                  checked={removeBg}
                  onChange={()=>setRemoveBg(!removeBg)}
                />
                Remove Background
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={randomSeed}
                  onChange={()=>setRandomSeed(!randomSeed)}
                />
                Randomize Seed
              </label>
            </div>

            <div className="target-face">
              <label>Seed</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="0"
                  max="9999"
                  value={seed}
                  onChange={(e)=>setSeed(e.target.value)}
                />
                <div className="face-number">{seed}</div>
              </div>
            </div>

            <div className="export-row">

              <div className="target-face">
                <label>Inference Steps</label>
                <div className="slider-row">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={steps}
                    onChange={(e)=>setSteps(e.target.value)}
                  />
                  <div className="face-number">{steps}</div>
                </div>
              </div>

              <div className="target-face">
                <label>Octree Resolution</label>
                <div className="slider-row">
                  <input
                    type="range"
                    min="64"
                    max="512"
                    value={resolution}
                    onChange={(e)=>setResolution(e.target.value)}
                  />
                  <div className="face-number">{resolution}</div>
                </div>
              </div>

            </div>

            <div className="export-row">

              <div className="target-face">
                <label>Guidance Scale</label>
                <input
                  type="number"
                  value={guidance}
                  onChange={(e)=>setGuidance(e.target.value)}
                />
              </div>

              <div className="target-face">
                <label>Number of Chunks</label>
                <div className="slider-row">
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    value={chunks}
                    onChange={(e)=>setChunks(e.target.value)}
                  />
                  <div className="face-number">{chunks}</div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* EXPORT */}
        {panelTab === "export" && (
          <div className="export-box">

            <div className="export-row">

              <div className="file-type">
                <label>File Type</label>
                <select
                  value={fileType}
                  onChange={(e)=>setFileType(e.target.value)}
                >
                  <option value="glb">glb</option>
                  <option value="obj">obj</option>
                  <option value="fbx">fbx</option>
                </select>
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={simplifyMesh}
                  onChange={()=>setSimplifyMesh(!simplifyMesh)}
                />
                Simplify Mesh
              </label>

            </div>

            <div className="target-face">
              <label>Target Face Number</label>
              <div className="slider-row">
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={targetFaces}
                  onChange={(e)=>setTargetFaces(e.target.value)}
                />
                <div className="face-number">{targetFaces}</div>
              </div>
            </div>

            <div className="export-actions">
              <button className="transform-btn">Transform</button>
              <button className="download-btn">Download</button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default UploadSection;
