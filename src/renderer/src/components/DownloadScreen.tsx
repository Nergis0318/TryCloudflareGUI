import { useTranslation, Trans } from "react-i18next";
import { AppIcon } from "./AppIcon";

interface Props {
  progress: number | null;
  onDownload: () => void;
}

export function DownloadScreen({ progress, onDownload }: Props) {
  const { t } = useTranslation();
  const isDownloading = progress !== null;

  return (
    <div className="download-screen">
      <AppIcon size={52} />
      <h2>{t("download.title")}</h2>
      <p>
        <Trans
          i18nKey="download.description"
          components={{ strong: <strong /> }}
        />
      </p>

      {isDownloading ? (
        <>
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {t("download.downloading", { p: progress })}
          </p>
        </>
      ) : (
        <button
          className="btn btn-primary"
          onClick={onDownload}
          style={{ fontSize: 14, padding: "10px 24px" }}
        >
          {t("download.button")}
        </button>
      )}
    </div>
  );
}
