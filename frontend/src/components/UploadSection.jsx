import { useState } from "react";

function UploadSection({ onUpload, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      return;
    }
    await onUpload(selectedFile);
    setSelectedFile(null);
    event.target.reset();
  };

  return (
    <form className="card section-card" onSubmit={handleSubmit}>
      <h2>Upload File</h2>
      <p className="section-note">Select a file and upload it to your secure storage.</p>
      <input
        type="file"
        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        required
      />
      <button className="btn btn-primary" type="submit" disabled={loading || !selectedFile}>
        {loading ? "Uploading..." : "Upload File"}
      </button>
    </form>
  );
}

export default UploadSection;
