import { contextBridge, ipcRenderer } from "electron";
import { TunnelConfig } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  // Cloudflared
  checkCloudflared: () => ipcRenderer.invoke("cloudflared:check"),
  downloadCloudflared: () => ipcRenderer.invoke("cloudflared:download"),
  onDownloadProgress: (cb: (percent: number) => void) => {
    const handler = (_: Electron.IpcRendererEvent, percent: number) =>
      cb(percent);
    ipcRenderer.on("cloudflared:progress", handler);
    return () => ipcRenderer.removeListener("cloudflared:progress", handler);
  },

  // Tunnels
  listTunnels: () => ipcRenderer.invoke("tunnel:list"),
  createTunnel: (config: Omit<TunnelConfig, "id">) =>
    ipcRenderer.invoke("tunnel:create", config),
  startTunnel: (id: string) => ipcRenderer.invoke("tunnel:start", id),
  stopTunnel: (id: string) => ipcRenderer.invoke("tunnel:stop", id),
  updateTunnel: (id: string, config: Omit<TunnelConfig, "id">) =>
    ipcRenderer.invoke("tunnel:update", id, config),
  deleteTunnel: (id: string) => ipcRenderer.invoke("tunnel:delete", id),
  onTunnelUpdated: (cb: (tunnel: unknown) => void) => {
    const handler = (_: Electron.IpcRendererEvent, tunnel: unknown) =>
      cb(tunnel);
    ipcRenderer.on("tunnel:updated", handler);
    return () => ipcRenderer.removeListener("tunnel:updated", handler);
  },

  // Shell
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url),
});
