const PreviewPanel = () => {
  return (
    <div className="preview-panel">
      
      <div className="preview-tabs">
        <span className="active">Generated Mesh</span>
        <span>Exporting Mesh</span>
        <span>Mesh Statistic</span>
      </div>

      <div className="preview-box">
        

        <div className="preview-content">
          <p>Welcome to Sq2Cube!</p>
          <p>No mesh here.</p>
        </div>
      </div>

    </div>
  );
};

export default PreviewPanel;