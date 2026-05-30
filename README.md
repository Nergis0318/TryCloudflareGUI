# TryCloudflare GUI

> [한국어 버전 보기 (README.ko.md)](./README.ko.md)

A simple and beautiful desktop GUI for managing [TryCloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/run-tunnel/trycloudflare/) tunnels.

**TryCloudflare GUI** lets you instantly expose your local development servers (web, API, databases, SSH, etc.) to the public internet using temporary `*.trycloudflare.com` URLs — powered by Cloudflare's `cloudflared`.

### ✨ Features

- **One-click tunnel management** — Start, stop, edit, and delete tunnels with a clean interface
- **Automatic cloudflared setup** — Downloads the official `cloudflared` binary automatically if missing
- **Quick presets** — One-click starters for React, Vite, Next.js, Express, Flask, Django, Laravel, Rails, ASP.NET, Go, and more
- **Persistent configurations** — Your tunnels are saved across app restarts (optional disposable tunnels available)
- **Multi-protocol support** — HTTP, HTTPS, TCP, and SSH
- **Real-time status** — Live updates when tunnels are ready with their public URLs
- **Multilingual UI** — English, 한국어, 日本語

### 📦 Installation

#### Download (Recommended)

Pre-built binaries for Windows, macOS, and Linux will be available in the [Releases](https://github.com/Nergis0318/TryCloudflareGUI/releases) page.

#### Build from Source

**Requirements:** [Bun](https://bun.sh) (recommended) or Node.js 20+

```bash
# Clone the repository
git clone https://github.com/Nergis0318/TryCloudflareGUI.git
cd TryCloudflareGUI

# Install dependencies
bun install

# Run in development mode
bun run dev

# Build the app
bun run build

# Package distributables (creates ./release folder)
bun run build:electron
```

### 🚀 Usage

1. Launch the app
2. If `cloudflared` is not installed, the app will prompt you to download it (one click)
3. Click **+ Add Tunnel** or use a preset on the right sidebar
4. Enter your local port (e.g., 3000 for React) and optional name
5. Click **Confirm** (or enable "Start immediately")
6. Copy the generated public `https://xxx.trycloudflare.com` URL and share it

Tunnels can be stopped/started individually and will automatically reconnect on errors when possible.

### 🛠 Tech Stack

- **Desktop:** Electron
- **UI:** React 19 + TypeScript + Vite
- **Styling:** Custom CSS (Pretendard font)
- **Internationalization:** i18next + react-i18next
- **Core:** Official `cloudflared` binary (auto-managed)

### 📄 License

[GNU General Public License v3.0](LICENSE)

### 🎨 Icon

The application icon is the `road-tunnel` icon from the **Streamline Ultimate Color** icon set.

- **Source:** streamline-ultimate-color:road-tunnel
- **License:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
