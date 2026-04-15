import { useState } from "react";

function UploadSection({ onUpload, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      return;
    }
    await onUpload(selectedFile);
    setSelectedFile(null);
    event.target.reset();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return (
    <form className="upload-card fade-in" onSubmit={handleSubmit}>
      <div className="section-head">
        <h2>Upload</h2>
        <span className="s3-badge">☁️ Connected to AWS S3</span>
      </div>

      <label
        className={`upload-dropzone ${dragActive ? "active" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <span className="upload-center-icon">⬆</span>
        <span className="upload-title">Drag & Drop or Click to Upload</span>
        <span className="upload-filename">
          {selectedFile ? selectedFile.name : "No file selected yet"}
        </span>
        <input
          type="file"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          required
        />
      </label>

      <button className="btn-gradient btn-upload" type="submit" disabled={loading || !selectedFile}>
        {loading ? (
          <span className="inline-center">
            <span className="spinner" />
            Uploading...
          </span>
        ) : (
          "Upload to Cloud"
        )}
      </button>
    </form>
  );
}

export default UploadSection;
