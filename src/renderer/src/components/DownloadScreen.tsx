interface Props {
  progress: number | null;
  onDownload: () => void;
}

export function DownloadScreen({ progress, onDownload }: Props) {
  const isDownloading = progress !== null;

  return (
    <div className="download-screen">
      <img
        src="/public/favicon.ico"
        alt="Cloudflare"
        style={{ width: 52, height: 52 }}
      />
      <h2>cloudflared 가 필요합니다</h2>
      <p>
        Try Cloudflare 터널을 사용하려면 <strong>cloudflared</strong> 바이너리가
        필요합니다. 아래 버튼을 눌러 자동으로 다운로드하세요.
      </p>

      {isDownloading ? (
        <>
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            다운로드 중... {progress}%
          </p>
        </>
      ) : (
        <button
          className="btn btn-primary"
          onClick={onDownload}
          style={{ fontSize: 14, padding: "10px 24px" }}
        >
          cloudflared 다운로드
        </button>
      )}
    </div>
  );
}
