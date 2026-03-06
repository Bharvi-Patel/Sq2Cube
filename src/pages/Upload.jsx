import React from "react";
import UploadSection from "../components/upload/UploadSection";
import PreviewPanel from "../components/upload/PreviewPanel";

const Upload = () => {
  return (
    <div className="upload-page">
      <UploadSection />
      <PreviewPanel />
    </div>
  );
};

export default Upload;