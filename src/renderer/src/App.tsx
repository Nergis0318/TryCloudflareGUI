import { useEffect, useRef, useState, useCallback } from "react";
import { TunnelInstance, TunnelConfig } from "./types";
import { TunnelCard } from "./components/TunnelCard";
import { TunnelForm } from "./components/TunnelForm";
import { DownloadScreen } from "./components/DownloadScreen";
import "./types/electron.d";

type Modal =
  | { type: "create" }
  | { type: "edit"; tunnel: TunnelInstance }
  | null;

type AppStage = "checking" | "needsDownload" | "ready";

export default function App() {
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
      alert("다운로드 실패: " + (e as Error).message);
    }
  };

  const handleCreate = async (config: Omit<TunnelConfig, "id">) => {
    const tunnel = await window.electronAPI.createTunnel(config);
    setTunnels((prev) => [...prev, tunnel]);
    setModal(null);
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
    if (!confirm("터널을 삭제하시겠습니까?")) return;
    await window.electronAPI.deleteTunnel(id);
    setTunnels((prev) => prev.filter((t) => t.id !== id));
  };

  const runningCount = tunnels.filter((t) => t.status === "running").length;

  if (stage === "checking") {
    return (
      <div className="download-screen">
        <img
          src="/public/favicon.ico"
          alt="Cloudflare"
          style={{ width: 52, height: 52 }}
        />
        <p style={{ color: "var(--text-muted)" }}>초기화 중...</p>
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
          <img
            src="/public/favicon.ico"
            alt="Cloudflare"
            style={{
              width: 24,
              height: 24,
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          Try<span>Cloudflare</span> GUI
          {runningCount > 0 && (
            <span className="badge badge-running" style={{ marginLeft: 4 }}>
              {runningCount}개 실행 중
            </span>
          )}
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setModal({ type: "create" })}
          >
            + 터널 추가
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
                터널이 없습니다
              </p>
              <p style={{ fontSize: 13 }}>
                "+ 터널 추가" 버튼으로 새 터널을 만들거나
                <br />
                오른쪽 프리셋을 클릭해 빠르게 시작하세요.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setModal({ type: "create" })}
              >
                + 터널 추가
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
      </div>

      {modal?.type === "create" && (
        <TunnelForm
          title="새 터널 추가"
          onConfirm={handleCreate}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === "edit" && (
        <TunnelForm
          title="터널 수정"
          initial={modal.tunnel.config}
          onConfirm={(config) => handleEdit(modal.tunnel.id, config)}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
