import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { MdImage } from "react-icons/md";
import { BiTargetLock } from "react-icons/bi";

const UploadSection = () => {
  const [tab, setTab] = useState("image");
  const [textPrompt, setTextPrompt] = useState("");
  const [image, setImage] = useState(null);

  // Handle file upload
  const handleFile = (file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  // Drag events
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

  return (
    <div className="prompt-container">

      {/* Tabs */}
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
          {/* label */}
          <div className="upload-label">
            <MdImage size={14} /> Image
          </div>

          {/* hidden input */}
          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            onChange={handleInputChange}
            hidden
          />

          {/* center area */}
          <label htmlFor="imageUpload" className="upload-center">

            {image ? (
              <img src={image} alt="preview" className="preview-image" />
            ) : (
              <>
                <FiUpload size={40} />
                <p>Drop Image Here</p>
                <p>- or -</p>
                <span className="upload-text">Click to Upload</span>
              </>
            )}

          </label>

          {/* bottom toolbar */}
          <div className="upload-toolbar">
            <FiUpload />
            <BiTargetLock />
            <MdImage />
          </div>
        </div>
      )}

      {/* TEXT TAB */}
      {tab === "text" && (
        <div className="text-box">
          <textarea
            placeholder="Describe the shape you want to generate..."
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
          />
        </div>
      )}

      {/* BUTTON */}
      <button className="gen-btn">Gen Shape</button>

    </div>
  );
};

export default UploadSection;