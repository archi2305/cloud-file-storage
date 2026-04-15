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
      <section className="card dashboard-header">
        <div>
          <p className="eyebrow">Workspace Overview</p>
          <h1>Cloud File Storage</h1>
          <p className="subtitle">Welcome back, {email}</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={onLogout}>
          Logout
        </button>
      </section>

      <section className="stats-grid">
        <article className="card stat-card">
          <p className="stat-label">Total Files</p>
          <p className="stat-value">{files.length}</p>
        </article>
        <article className="card stat-card">
          <p className="stat-label">Storage Mode</p>
          <p className="stat-value stat-value-small">Hybrid Ready</p>
        </article>
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
