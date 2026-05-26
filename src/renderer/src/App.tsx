import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation, Trans } from "react-i18next";
import { TunnelInstance, TunnelConfig } from "./types";
import { TunnelCard } from "./components/TunnelCard";
import { TunnelForm } from "./components/TunnelForm";
import { DownloadScreen } from "./components/DownloadScreen";
import { Sidebar } from "./components/Sidebar";
import { AppIcon } from "./components/AppIcon";
import "./types/electron.d";

type Modal =
  | { type: "create"; preset?: Omit<TunnelConfig, "id" | "name"> }
  | { type: "edit"; tunnel: TunnelInstance }
  | null;

type AppStage = "checking" | "needsDownload" | "ready";

export default function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language?.slice(0, 2) ?? "ko";
    document.body.setAttribute("data-lang", lang);
    document.documentElement.lang = lang;
  }, [i18n.language]);

  const [stage, setStage] = useState<AppStage>("checking");
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [tunnels, setTunnels] = useState<TunnelInstance[]>([]);
  const [modal, setModal] = useState<Modal>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  // Subscribe to live tunnel updates from main process
  useEffect(() => {
    const unsub = window.electronAPI.onTunnelUpdated((updated) => {
      setTunnels((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
    });
    cleanupRef.current.push(unsub);
    return () => {
      unsub();
    };
  }, []);

  const loadTunnels = useCallback(async () => {
    const list = await window.electronAPI.listTunnels();
    setTunnels(list);
  }, []);

  // Check cloudflared on mount
  useEffect(() => {
    window.electronAPI.checkCloudflared().then((installed) => {
      if (installed) {
        setStage("ready");
        loadTunnels();
      } else {
        setStage("needsDownload");
      }
    });
  }, [loadTunnels]);

  const handleDownload = async () => {
    setDownloadProgress(0);
    const unsub = window.electronAPI.onDownloadProgress((p) =>
      setDownloadProgress(p),
    );
    try {
      await window.electronAPI.downloadCloudflared();
      unsub();
      setDownloadProgress(null);
      setStage("ready");
      loadTunnels();
    } catch (e) {
      unsub();
      setDownloadProgress(null);
      alert(t("app.downloadFailed") + (e as Error).message);
    }
  };

  const handleCreate = async (
    config: Omit<TunnelConfig, "id">,
    startImmediately: boolean,
  ) => {
    const tunnel = await window.electronAPI.createTunnel(config);
    setTunnels((prev) => [...prev, tunnel]);
    setModal(null);
    if (startImmediately) {
      await window.electronAPI.startTunnel(tunnel.id);
    }
  };

  const handleEdit = async (id: string, config: Omit<TunnelConfig, "id">) => {
    const updated = await window.electronAPI.updateTunnel(id, config);
    if (updated) {
      setTunnels((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
    setModal(null);
  };

  const handleStart = async (id: string) => {
    await window.electronAPI.startTunnel(id);
    // status updates come via onTunnelUpdated
  };

  const handleStop = async (id: string) => {
    const updated = await window.electronAPI.stopTunnel(id);
    if (updated)
      setTunnels((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("tunnelCard.deleteConfirm"))) return;
    await window.electronAPI.deleteTunnel(id);
    setTunnels((prev) => prev.filter((t) => t.id !== id));
  };

  const runningCount = tunnels.filter((t) => t.status === "running").length;

  if (stage === "checking") {
    return (
      <div className="download-screen">
        <AppIcon />
        <p style={{ color: "var(--text-muted)" }}>{t("app.initializing")}</p>
      </div>
    );
  }

  if (stage === "needsDownload") {
    return (
      <DownloadScreen progress={downloadProgress} onDownload={handleDownload} />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">
          <AppIcon />
          Try<span>Cloudflare</span> GUI
          {runningCount > 0 && (
            <span className="badge badge-running" style={{ marginLeft: 4 }}>
              {t("app.runningCount", { count: runningCount })}
            </span>
          )}
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setModal({ type: "create" })}
          >
            {t("app.addTunnel")}
          </button>
        </div>
      </header>

      <div className="main">
        <div className="tunnel-list scrollbar-thin">
          {tunnels.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌐</div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-dim)",
                }}
              >
                {t("empty.noTunnels")}
              </p>
              <p style={{ fontSize: 13 }}>
                <Trans
                  i18nKey="empty.description"
                  components={{ br: <br /> }}
                />
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setModal({ type: "create" })}
              >
                {t("empty.addTunnel")}
              </button>
            </div>
          ) : (
            tunnels.map((tunnel) => (
              <TunnelCard
                key={tunnel.id}
                tunnel={tunnel}
                onStart={() => handleStart(tunnel.id)}
                onStop={() => handleStop(tunnel.id)}
                onEdit={() => setModal({ type: "edit", tunnel })}
                onDelete={() => handleDelete(tunnel.id)}
              />
            ))
          )}
        </div>
        <Sidebar
          onPresetClick={(config) =>
            setModal({ type: "create", preset: config })
          }
        />
      </div>

      {modal?.type === "create" && (
        <TunnelForm
          title={t("form.newTunnel")}
          initial={
            modal.preset
              ? {
                  name: "",
                  localHost: modal.preset.localHost,
                  localPort: modal.preset.localPort,
                  protocol: modal.preset.protocol,
                  isDisposable: true,
                }
              : undefined
          }
          onConfirm={handleCreate}
          onCancel={() => setModal(null)}
          showStartImmediately
          defaultStartImmediately={true}
        />
      )}

      {modal?.type === "edit" && (
        <TunnelForm
          title={t("form.editTunnel")}
          initial={modal.tunnel.config}
          onConfirm={(config) => handleEdit(modal.tunnel.id, config)}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
