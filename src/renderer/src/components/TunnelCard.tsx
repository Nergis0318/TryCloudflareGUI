import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { config, status, url, error } = tunnel;
  const isRunning = status === "running";
  const isStarting = status === "starting";
  const isBusy = isRunning || isStarting;

  return (
    <div className={`tunnel-card ${status}`}>
      <div className={`tunnel-status-dot status-${status}`} />

      <div className="tunnel-info">
        <div className="tunnel-name">
          {config.name ||
            t("tunnelCard.defaultName", { id: config.id.slice(0, 6) })}
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
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
            {t("tunnelCard.connecting")}
          </div>
        )}
      </div>

      <div className="tunnel-actions">
        <span className={`badge ${isRunning ? "badge-running" : ""}`}>
          {t(`tunnelCard.status.${status}`)}
        </span>

        {!isBusy ? (
          <button className="btn btn-primary btn-sm" onClick={onStart}>
            {t("tunnelCard.start")}
          </button>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            onClick={onStop}
            disabled={isStarting}
          >
            {t("tunnelCard.stop")}
          </button>
        )}

        <button
          className="btn-icon"
          onClick={onEdit}
          title={t("tunnelCard.edit")}
          disabled={isBusy}
        >
          ✎
        </button>
        <button
          className="btn-icon"
          onClick={onDelete}
          title={t("tunnelCard.delete")}
          style={{ color: "var(--red)" }}
          disabled={isBusy}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
