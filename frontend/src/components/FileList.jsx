function FileList({ files, onRefresh, loading, getDownloadUrl }) {
  return (
    <div className="card section-card">
      <div className="section-header">
        <h2>Your Files</h2>
        <button className="btn btn-secondary" type="button" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {files.length === 0 ? (
        <p className="empty-state">No files uploaded yet.</p>
      ) : (
        <ul className="file-list">
          {files.map((fileItem) => (
            <li key={`${fileItem.filename}-${fileItem.upload_time}`} className="file-item">
              <div className="file-icon" aria-hidden="true">
                📄
              </div>
              <div className="file-main">
                <p className="filename">{fileItem.filename}</p>
                <p className="file-meta">
                  Uploaded: {new Date(fileItem.upload_time).toLocaleString()}
                </p>
              </div>
              <a
                className="btn btn-primary"
                href={getDownloadUrl(fileItem.filename)}
                target="_blank"
                rel="noreferrer"
              >
                ⬇ Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FileList;
