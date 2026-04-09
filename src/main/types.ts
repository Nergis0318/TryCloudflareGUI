export type TunnelStatus = "stopped" | "starting" | "running" | "error";

export interface TunnelConfig {
  id: string;
  name: string;
  localPort: number;
  localHost: string;
  protocol: "http" | "https" | "tcp" | "ssh";
  isDisposable?: boolean;
}

export interface TunnelInstance {
  id: string;
  config: TunnelConfig;
  status: TunnelStatus;
  url?: string;
  pid?: number;
  error?: string;
  createdAt: number;
  startedAt?: number;
}

export interface AppState {
  tunnels: TunnelInstance[];
}

// IPC channel names
export const IPC = {
  TUNNEL_START: "tunnel:start",
  TUNNEL_STOP: "tunnel:stop",
  TUNNEL_DELETE: "tunnel:delete",
  TUNNEL_UPDATE: "tunnel:update",
  TUNNEL_LIST: "tunnel:list",
  TUNNEL_STATUS: "tunnel:status",
  CLOUDFLARED_CHECK: "cloudflared:check",
  CLOUDFLARED_DOWNLOAD: "cloudflared:download",
} as const;
