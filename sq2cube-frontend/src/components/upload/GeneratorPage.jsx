import { useState } from "react";
import UploadSection from "./UploadSection";
import PreviewPanel from "./PreviewPanel";
import "./generator.css";

const GeneratorPage = () => {
  const [glbUrl, setGlbUrl] = useState(null);

  return (
    <div className="generator-container">
      <UploadSection onComplete={(data) => setGlbUrl(data.urls?.glb ?? null)} />
      <PreviewPanel glbUrl={glbUrl} />
    </div>
  );
};

export default GeneratorPage;