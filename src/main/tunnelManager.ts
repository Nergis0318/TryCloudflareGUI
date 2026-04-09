import { ChildProcess, spawn } from "child_process";
import { EventEmitter } from "events";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import { TunnelConfig, TunnelInstance, TunnelStatus } from "./types";
import { getCloudflaredExecutable } from "./cloudflaredDownloader";

// Emits: 'tunnel-updated' with TunnelInstance
class TunnelManager extends EventEmitter {
  private tunnels: Map<string, TunnelInstance> = new Map();
  private processes: Map<string, ChildProcess> = new Map();

  constructor() {
    super();
    this.loadTunnels();
  }

  private getStorePath(): string {
    return path.join(app.getPath("userData"), "tunnels.json");
  }

  private loadTunnels(): void {
    try {
      const p = this.getStorePath();
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, "utf-8");
        const parsed: TunnelInstance[] = JSON.parse(data);
        for (const t of parsed) {
          // Reset status to stopped on load
          t.status = "stopped";
          t.url = undefined;
          t.pid = undefined;
          t.error = undefined;
          t.startedAt = undefined;
          this.tunnels.set(t.id, t);
        }
      }
    } catch (err) {
      console.error("Failed to load tunnels:", err);
    }
  }

  private saveTunnels(): void {
    try {
      const list = Array.from(this.tunnels.values()).filter(
        (t) => !t.config.isDisposable,
      );
      fs.writeFileSync(
        this.getStorePath(),
        JSON.stringify(list, null, 2),
        "utf-8",
      );
    } catch (err) {
      console.error("Failed to save tunnels:", err);
    }
  }

  createTunnel(config: Omit<TunnelConfig, "id">): TunnelInstance {
    const id = crypto.randomUUID();
    const tunnel: TunnelInstance = {
      id,
      config: { ...config, id },
      status: "stopped",
      createdAt: Date.now(),
    };
    this.tunnels.set(id, tunnel);
    this.saveTunnels();
    return tunnel;
  }

  updateTunnel(
    id: string,
    config: Omit<TunnelConfig, "id">,
  ): TunnelInstance | null {
    const tunnel = this.tunnels.get(id);
    if (!tunnel) return null;
    if (tunnel.status === "running" || tunnel.status === "starting") {
      throw new Error("터널이 실행 중입니다. 먼저 중지하세요.");
    }
    tunnel.config = { ...config, id };
    this.tunnels.set(id, tunnel);
    this.saveTunnels();
    return tunnel;
  }

  deleteTunnel(id: string): boolean {
    const tunnel = this.tunnels.get(id);
    if (!tunnel) return false;
    if (tunnel.status === "running" || tunnel.status === "starting") {
      this.stopTunnel(id);
    }
    this.tunnels.delete(id);
    this.saveTunnels();
    return true;
  }

  startTunnel(id: string): void {
    const tunnel = this.tunnels.get(id);
    if (!tunnel) throw new Error(`터널 없음: ${id}`);
    if (tunnel.status === "running" || tunnel.status === "starting") return;

    this.updateStatus(id, "starting", { url: undefined, error: undefined });

    const exe = getCloudflaredExecutable();
    const { localHost, localPort, protocol } = tunnel.config;
    const target = `${protocol}://${localHost}:${localPort}`;

    const child = spawn(exe, ["tunnel", "--url", target], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.processes.set(id, child);

    const urlRegex = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;
    let urlFound = false;

    const onData = (data: Buffer) => {
      const text = data.toString();
      if (!urlFound) {
        const match = text.match(urlRegex);
        if (match) {
          urlFound = true;
          this.updateStatus(id, "running", {
            url: match[0],
            startedAt: Date.now(),
          });
        }
      }
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);

    child.on("exit", (code) => {
      this.processes.delete(id);
      const current = this.tunnels.get(id);
      if (!current) return;
      if (current.status !== "stopped") {
        this.updateStatus(id, code === 0 ? "stopped" : "error", {
          error: code !== 0 ? `프로세스가 코드 ${code}로 종료됨` : undefined,
        });
      }
    });

    child.on("error", (err) => {
      this.processes.delete(id);
      this.updateStatus(id, "error", { error: err.message });
    });
  }

  stopTunnel(id: string): void {
    const child = this.processes.get(id);
    if (child) {
      child.kill("SIGTERM");
      this.processes.delete(id);
    }
    this.updateStatus(id, "stopped", { url: undefined, startedAt: undefined });
  }

  getTunnel(id: string): TunnelInstance | undefined {
    return this.tunnels.get(id);
  }

  getAllTunnels(): TunnelInstance[] {
    return Array.from(this.tunnels.values());
  }

  stopAll(): void {
    for (const id of this.tunnels.keys()) {
      this.stopTunnel(id);
    }
  }

  private updateStatus(
    id: string,
    status: TunnelStatus,
    extra: Partial<TunnelInstance> = {},
  ): void {
    const tunnel = this.tunnels.get(id);
    if (!tunnel) return;
    Object.assign(tunnel, { status, ...extra });
    this.emit("tunnel-updated", { ...tunnel });
  }
}

export const tunnelManager = new TunnelManager();
