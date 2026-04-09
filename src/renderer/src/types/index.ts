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

export interface TunnelPreset {
  id: string;
  name: string;
  config: Omit<TunnelConfig, "id">;
  createdAt: number;
}
