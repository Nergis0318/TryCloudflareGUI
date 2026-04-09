import { TunnelInstance } from "../types";

interface Props {
  tunnel: TunnelInstance;
  onStart: () => void;
  onStop: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TunnelCard({
  tunnel,
  onStart,
  onStop,
  onEdit,
  onDelete,
}: Props) {
  const { config, status, url, error } = tunnel;
  const isRunning = status === "running";
  const isStarting = status === "starting";
  const isBusy = isRunning || isStarting;

  return (
    <div className={`tunnel-card ${status}`}>
      <div className={`tunnel-status-dot status-${status}`} />

      <div className="tunnel-info">
        <div className="tunnel-name">
          {config.name || `터널 #${config.id.slice(0, 6)}`}
        </div>
        <div className="tunnel-target">
          {config.protocol}://{config.localHost}:{config.localPort}
        </div>
        {url && (
          <div
            className="tunnel-url"
            onClick={() => window.electronAPI.openExternal(url)}
            title={url}
          >
            ↗ {url}
          </div>
        )}
        {error && <div className="tunnel-error">⚠ {error}</div>}
        {isStarting && (
          <div style={{ fontSize: 12, color: "var(--yellow)" }}>연결 중...</div>
        )}
      </div>

      <div className="tunnel-actions">
        <span className={`badge ${isRunning ? "badge-running" : ""}`}>
          {status === "stopped"
            ? "중지됨"
            : status === "starting"
              ? "시작 중"
              : status === "running"
                ? "실행 중"
                : "오류"}
        </span>

        {!isBusy ? (
          <button className="btn btn-primary btn-sm" onClick={onStart}>
            ▶ 시작
          </button>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            onClick={onStop}
            disabled={isStarting}
          >
            ■ 중지
          </button>
        )}

        <button
          className="btn-icon"
          onClick={onEdit}
          title="수정"
          disabled={isBusy}
        >
          ✎
        </button>
        <button
          className="btn-icon"
          onClick={onDelete}
          title="삭제"
          style={{ color: "var(--red)" }}
          disabled={isBusy}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
