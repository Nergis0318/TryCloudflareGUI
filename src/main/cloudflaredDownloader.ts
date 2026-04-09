import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as tar from "tar";
import * as os from "os";
import { execSync } from "child_process";
import { app } from "electron";

// Official latest-release base URL per:
// https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/
const LATEST_BASE =
  "https://github.com/cloudflare/cloudflared/releases/latest/download";

type BinaryInfo = {
  url: string;
  filename: string;
  isTgz: boolean;
};

function getBinaryInfo(): BinaryInfo {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === "win32") {
    const file =
      arch === "x64"
        ? "cloudflared-windows-amd64.exe"
        : "cloudflared-windows-386.exe";
    return {
      url: `${LATEST_BASE}/${file}`,
      filename: "cloudflared.exe",
      isTgz: false,
    };
  }

  if (platform === "darwin") {
    // macOS releases are .tgz archives
    const file =
      arch === "arm64"
        ? "cloudflared-darwin-arm64.tgz"
        : "cloudflared-darwin-amd64.tgz";
    return {
      url: `${LATEST_BASE}/${file}`,
      filename: "cloudflared",
      isTgz: true,
    };
  }

  // Linux
  let linuxArch: string;
  switch (arch) {
    case "x64":
      linuxArch = "amd64";
      break;
    case "ia32":
      linuxArch = "386";
      break;
    case "arm64":
      linuxArch = "arm64";
      break;
    case "arm":
      linuxArch = "arm";
      break;
    default:
      linuxArch = "amd64";
      break;
  }
  const file = `cloudflared-linux-${linuxArch}`;
  return {
    url: `${LATEST_BASE}/${file}`,
    filename: "cloudflared",
    isTgz: false,
  };
}

export function getBinaryDir(): string {
  const binDir = path.join(app.getPath("userData"), "bin");
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }
  return binDir;
}

export function getCloudflaredPath(): string {
  const { filename } = getBinaryInfo();
  return path.join(getBinaryDir(), filename);
}

export function isCloudflaredInstalled(): boolean {
  // Prefer system-installed cloudflared in PATH
  try {
    execSync("cloudflared --version", { stdio: "ignore" });
    return true;
  } catch {
    /* not in PATH */
  }

  return fs.existsSync(getCloudflaredPath());
}

export function getCloudflaredExecutable(): string {
  try {
    execSync("cloudflared --version", { stdio: "ignore" });
    return "cloudflared";
  } catch {
    /* not in PATH */
  }
  return getCloudflaredPath();
}

function downloadToFile(
  url: string,
  destPath: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          downloadToFile(res.headers.location!, destPath, onProgress)
            .then(resolve)
            .catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} from ${url}`));
          return;
        }

        const total = parseInt(res.headers["content-length"] ?? "0", 10);
        let downloaded = 0;

        const tmpPath = destPath + ".tmp";
        const out = fs.createWriteStream(tmpPath);

        res.on("data", (chunk: Buffer) => {
          downloaded += chunk.length;
          if (total > 0) onProgress(Math.round((downloaded / total) * 100));
        });

        res.pipe(out);

        out.on("finish", () => {
          out.close(() => {
            fs.renameSync(tmpPath, destPath);
            resolve();
          });
        });
        out.on("error", (err) => {
          fs.unlink(tmpPath, () => {});
          reject(err);
        });
      })
      .on("error", reject);
  });
}

async function extractTgz(tgzPath: string, destDir: string): Promise<void> {
  // The macOS tgz contains a single binary named 'cloudflared'
  await tar.extract({ file: tgzPath, cwd: destDir, strict: true });
}

export async function downloadCloudflared(
  onProgress: (percent: number) => void,
): Promise<void> {
  const { url, filename, isTgz } = getBinaryInfo();
  const binDir = getBinaryDir();
  const finalPath = path.join(binDir, filename);

  if (isTgz) {
    // Download .tgz, extract, then delete archive
    const tgzPath = finalPath + ".tgz";
    await downloadToFile(url, tgzPath, (p) => onProgress(Math.round(p * 0.9)));
    await extractTgz(tgzPath, binDir);
    fs.unlinkSync(tgzPath);
  } else {
    await downloadToFile(url, finalPath, onProgress);
  }

  // Ensure executable bit on Unix
  if (os.platform() !== "win32") {
    fs.chmodSync(finalPath, 0o755);
  }

  onProgress(100);
}
