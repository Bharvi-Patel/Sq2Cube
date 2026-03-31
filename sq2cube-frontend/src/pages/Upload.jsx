import React, { useState } from "react";
import UploadSection from "../components/upload/UploadSection";
import PreviewPanel from "../components/upload/PreviewPanel";
import "./Upload.css";

const Upload = () => {
  const [glbUrl, setGlbUrl]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleProcessing = () => {
    setLoading(true);
  };

  const handleComplete = (data) => {
    setGlbUrl(data.urls?.glb ?? null);
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
  };

  return (
    <div className="upload-page">
      <UploadSection
        onProcessing={handleProcessing}
        onComplete={handleComplete}
        onError={handleError}
      />
      <PreviewPanel glbUrl={glbUrl} loading={loading} />
    </div>
  );
};

export default Upload;