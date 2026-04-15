function FileList({ files, onRefresh, loading, getDownloadUrl }) {
  return (
    <section className="files-section fade-in">
      <div className="section-head">
        <h2>Your Files</h2>
        <button className="btn-outline" type="button" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            🚀
          </div>
          <p>No files yet 🚀</p>
        </div>
      ) : (
        <ul className="file-list">
          {files.map((fileItem) => (
            <li key={`${fileItem.filename}-${fileItem.upload_time}`} className="file-item">
              <div className="file-icon-dark" aria-hidden="true">
                📁
              </div>
              <div className="file-main">
                <p className="filename">{fileItem.filename}</p>
                <p className="file-meta">
                  Uploaded: {new Date(fileItem.upload_time).toLocaleString()}
                </p>
              </div>
              <a
                className="btn-gradient btn-download"
                href={getDownloadUrl(fileItem.filename)}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default FileList;
