import { app, BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import { IPC, TunnelConfig } from "./types";
import { tunnelManager } from "./tunnelManager";
import {
  isCloudflaredInstalled,
  downloadCloudflared,
} from "./cloudflaredDownloader";

const isDev = process.env.NODE_ENV === "development";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "default",
    title: "TryCloudflare GUI",
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  // Push tunnel status updates to renderer
  tunnelManager.on("tunnel-updated", (tunnel) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("tunnel:updated", tunnel);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  tunnelManager.stopAll();
  if (process.platform !== "darwin") app.quit();
});

// ── IPC Handlers ──────────────────────────────────────────────

ipcMain.handle(IPC.CLOUDFLARED_CHECK, () => {
  return isCloudflaredInstalled();
});

ipcMain.handle(IPC.CLOUDFLARED_DOWNLOAD, async () => {
  await downloadCloudflared((percent) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("cloudflared:progress", percent);
    }
  });
  return true;
});

ipcMain.handle(IPC.TUNNEL_LIST, () => {
  return tunnelManager.getAllTunnels();
});

ipcMain.handle(IPC.TUNNEL_START, (_e, id: string) => {
  tunnelManager.startTunnel(id);
  return tunnelManager.getTunnel(id);
});

ipcMain.handle(IPC.TUNNEL_STOP, (_e, id: string) => {
  tunnelManager.stopTunnel(id);
  return tunnelManager.getTunnel(id);
});

ipcMain.handle(
  IPC.TUNNEL_UPDATE,
  (_e, id: string, config: Omit<TunnelConfig, "id">) => {
    return tunnelManager.updateTunnel(id, config);
  },
);

ipcMain.handle(IPC.TUNNEL_DELETE, (_e, id: string) => {
  return tunnelManager.deleteTunnel(id);
});

// Create tunnel (add new)
ipcMain.handle("tunnel:create", (_e, config: Omit<TunnelConfig, "id">) => {
  return tunnelManager.createTunnel(config);
});

// Open URL in browser
ipcMain.handle("shell:openExternal", (_e, url: string) => {
  shell.openExternal(url);
});
