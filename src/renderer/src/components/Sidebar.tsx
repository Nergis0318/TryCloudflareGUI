import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { TunnelConfig } from "../types";

interface Preset {
  name: string;
  config: Omit<TunnelConfig, "id" | "name">;
}

const PRESETS: Preset[] = [
  {
    name: "React",
    config: { localHost: "localhost", localPort: 3000, protocol: "http" },
  },
  {
    name: "Vite",
    config: { localHost: "localhost", localPort: 5173, protocol: "http" },
  },
  {
    name: "Next.js",
    config: { localHost: "localhost", localPort: 3000, protocol: "http" },
  },
  {
    name: "Express",
    config: { localHost: "localhost", localPort: 3000, protocol: "http" },
  },
  {
    name: "Flask",
    config: { localHost: "localhost", localPort: 5000, protocol: "http" },
  },
  {
    name: "Django",
    config: { localHost: "localhost", localPort: 8000, protocol: "http" },
  },
  {
    name: "Laravel",
    config: { localHost: "localhost", localPort: 8000, protocol: "http" },
  },
  {
    name: "Rails",
    config: { localHost: "localhost", localPort: 3000, protocol: "http" },
  },
  {
    name: "ASP.NET",
    config: { localHost: "localhost", localPort: 5000, protocol: "https" },
  },
  {
    name: "Go",
    config: { localHost: "localhost", localPort: 8080, protocol: "http" },
  },
];

interface Props {
  onPresetClick: (config: Omit<TunnelConfig, "id" | "name">) => void;
}

export function Sidebar({ onPresetClick }: Props) {
  const { t } = useTranslation();

  return (
    <div className="sidebar scrollbar-thin">
      <LanguageSwitcher />

      <div>
        <div className="sidebar-title">{t("sidebar.presets")}</div>
        {PRESETS.map((preset) => (
          <div
            key={preset.name}
            className="preset-item"
            onClick={() => onPresetClick(preset.config)}
          >
            <span className="preset-name">{preset.name}</span>
            <span className="preset-meta">
              {preset.config.protocol}://{preset.config.localHost}:
              {preset.config.localPort}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
