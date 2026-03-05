import UploadSection from "./UploadSection";
import PreviewPanel from "./PreviewPanel";
import "./generator.css";

const GeneratorPage = () => {
  return (
    <div className="generator-container">
      <UploadSection /> 
      <PreviewPanel />
    </div>
  );
};

export default GeneratorPage;