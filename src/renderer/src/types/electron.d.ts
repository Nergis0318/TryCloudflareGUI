import { TunnelConfig, TunnelInstance } from "./types";

interface ElectronAPI {
  checkCloudflared: () => Promise<boolean>;
  downloadCloudflared: () => Promise<boolean>;
  onDownloadProgress: (cb: (percent: number) => void) => () => void;

  listTunnels: () => Promise<TunnelInstance[]>;
  createTunnel: (config: Omit<TunnelConfig, "id">) => Promise<TunnelInstance>;
  startTunnel: (id: string) => Promise<TunnelInstance>;
  stopTunnel: (id: string) => Promise<TunnelInstance>;
  updateTunnel: (
    id: string,
    config: Omit<TunnelConfig, "id">,
  ) => Promise<TunnelInstance>;
  deleteTunnel: (id: string) => Promise<boolean>;
  onTunnelUpdated: (cb: (tunnel: TunnelInstance) => void) => () => void;

  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
