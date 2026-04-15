import { useEffect, useState } from "react";
import FileList from "../components/FileList";
import UploadSection from "../components/UploadSection";
import { fetchFiles, getDownloadUrl, uploadFile } from "../api/filesApi";

function DashboardPage({ email, onLogout }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadFiles = async () => {
    setLoadingFiles(true);
    setError("");
    try {
      const data = await fetchFiles(email);
      setFiles(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not fetch files.");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleUpload = async (file) => {
    setUploading(true);
    setMessage("");
    setError("");
    try {
      await uploadFile(email, file);
      setMessage("File uploaded successfully.");
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.detail || "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="page-center">
      <section className="card dashboard-header-bar">
        <div className="header-brand">
          <h1>Cloud File Storage</h1>
          <p className="subtitle">Secure file dashboard</p>
        </div>
        <div className="header-actions">
          <span className="user-badge">{email}</span>
          <button className="btn btn-secondary" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </section>

      <UploadSection onUpload={handleUpload} loading={uploading} />

      {message ? <p className="message success">{message}</p> : null}
      {error ? <p className="message error">{error}</p> : null}

      <FileList
        files={files}
        loading={loadingFiles}
        onRefresh={loadFiles}
        getDownloadUrl={getDownloadUrl}
      />
    </main>
  );
}

export default DashboardPage;
