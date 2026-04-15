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
        fileKey: fileKey,
        email,
      });

      setMessage("File uploaded to AWS S3 successfully");
      await loadFiles();
    } catch (err) {
      // Fallback path: if direct upload fails due to CORS/network policy,
      // upload through backend to keep user flow working.
      try {
        await uploadFile(email, file);
        setMessage("File uploaded successfully (fallback mode).");
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
    <main className="page-center">
      <section className="card dashboard-header-bar">
        <div className="header-brand">
          <h1>Cloud File Storage</h1>
          <p className="subtitle">Secure file dashboard</p>
          <p className="cloud-indicator">☁️ Stored in AWS S3</p>
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
