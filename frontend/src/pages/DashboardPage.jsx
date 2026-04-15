import { useEffect, useState } from "react";
import FileList from "../components/FileList";
import UploadSection from "../components/UploadSection";
import {
  fetchFiles,
  generateUploadUrl,
  getDownloadUrl,
  saveFile,
  uploadFile,
} from "../api/filesApi";

function DashboardPage({ email, onLogout }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ type: "", text: "" });

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

  useEffect(() => {
    if (!toast.text) {
      return undefined;
    }
    const timeout = setTimeout(() => {
      setToast({ type: "", text: "" });
    }, 2600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleUpload = async (file) => {
    setUploading(true);
    setToast({ type: "", text: "" });
    setError("");
    try {
      const { upload_url: uploadUrl, file_key: fileKey } = await generateUploadUrl({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!uploadResponse.ok) {
        throw new Error("Direct upload to S3 failed.");
      }

      await saveFile({
        filename: file.name,
        fileKey,
        email,
      });

      setToast({ type: "success", text: "File uploaded to AWS S3 successfully." });
      await loadFiles();
    } catch (err) {
      try {
        await uploadFile(email, file);
        setToast({ type: "success", text: "File uploaded successfully (fallback mode)." });
        await loadFiles();
      } catch (fallbackErr) {
        setError(
          fallbackErr.response?.data?.detail ||
            err.response?.data?.detail ||
            err.message ||
            "File upload failed."
        );
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="dashboard-layout">
      <div className="bg-blob blob-one" />
      <div className="bg-blob blob-two" />

      <aside className="sidebar fade-in">
        <div className="sidebar-brand">Cloud Storage</div>
        <nav className="sidebar-menu">
          <a className="sidebar-link active" href="#dashboard">
            <span aria-hidden="true">▦</span> Dashboard
          </a>
          <a className="sidebar-link" href="#upload">
            <span aria-hidden="true">⤴</span> Upload
          </a>
          <a className="sidebar-link" href="#files">
            <span aria-hidden="true">☰</span> Files
          </a>
        </nav>
      </aside>

      <section className="main-panel">
        <header className="topbar fade-in">
          <div className="topbar-divider" />
          <div className="topbar-actions">
            <span className="user-pill">{email}</span>
            <button className="btn-outline" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section id="dashboard" className="hero fade-in">
          <h1>Cloud Storage Dashboard</h1>
          <p className="hero-subtitle">Manage your files securely in AWS</p>
        </section>

        <section className="stats-grid fade-in">
          <article className="stat-card">
            <p className="stat-label">Total Files</p>
            <p className="stat-value">{files.length}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Storage Type</p>
            <p className="stat-value">AWS S3</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Status</p>
            <p className="stat-value">Active</p>
          </article>
        </section>

        <section id="upload">
          <UploadSection onUpload={handleUpload} loading={uploading} />
        </section>

        {toast.text ? <p className={`toast ${toast.type}`}>{toast.text}</p> : null}
        {error ? <p className="toast error">{error}</p> : null}

        <section id="files">
          <FileList
            files={files}
            loading={loadingFiles}
            onRefresh={loadFiles}
            getDownloadUrl={getDownloadUrl}
          />
        </section>
      </section>
    </main>
  );
}

export default DashboardPage;
