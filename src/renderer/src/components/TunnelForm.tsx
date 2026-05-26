import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TunnelConfig } from "../types";

type ConfigDraft = Omit<TunnelConfig, "id">;

interface Props {
  initial?: ConfigDraft;
  onConfirm: (config: ConfigDraft, startImmediately: boolean) => void;
  onCancel: () => void;
  title: string;
  showStartImmediately?: boolean;
  defaultStartImmediately?: boolean;
}

const DEFAULT: ConfigDraft = {
  name: "",
  localHost: "localhost",
  localPort: 3000,
  protocol: "http",
  isDisposable: true,
};

export function TunnelForm({
  initial,
  onConfirm,
  onCancel,
  title,
  showStartImmediately = false,
  defaultStartImmediately = true,
}: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ConfigDraft>(initial ?? DEFAULT);
  const [startImmediately, setStartImmediately] = useState(
    defaultStartImmediately,
  );

  const set = (key: keyof ConfigDraft, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.localPort || form.localPort < 1 || form.localPort > 65535) {
      alert(t("form.portError"));
      return;
    }
    onConfirm(form, startImmediately);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>

        <div className="form-group">
          <label>{t("form.nameLabel")}</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("form.namePlaceholder")}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t("form.protocol")}</label>
            <select
              value={form.protocol}
              onChange={(e) => set("protocol", e.target.value)}
            >
              <option value="http">http</option>
              <option value="https">https</option>
              <option value="tcp">tcp</option>
              <option value="ssh">ssh</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label>{t("form.localHost")}</label>
            <input
              value={form.localHost}
              onChange={(e) => set("localHost", e.target.value)}
              placeholder={t("form.localHostPlaceholder")}
            />
          </div>
        </div>

        <div className="form-group">
          <label>{t("form.port")}</label>
          <input
            type="number"
            min={1}
            max={65535}
            value={form.localPort}
            onChange={(e) => set("localPort", parseInt(e.target.value) || 0)}
            placeholder={t("form.portPlaceholder")}
          />
        </div>

        <div
          className="form-group"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          <input
            type="checkbox"
            id="isDisposable"
            checked={form.isDisposable !== false}
            onChange={(e) => set("isDisposable", e.target.checked)}
            style={{ width: "auto" }}
          />
          <label
            htmlFor="isDisposable"
            style={{ cursor: "pointer", marginBottom: 0 }}
          >
            {t("form.disposableLabel")}
          </label>
        </div>

        {showStartImmediately && (
          <div
            className="form-group"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <input
              type="checkbox"
              id="startImmediately"
              checked={startImmediately}
              onChange={(e) => setStartImmediately(e.target.checked)}
              style={{ width: "auto" }}
            />
            <label
              htmlFor="startImmediately"
              style={{ cursor: "pointer", marginBottom: 0 }}
            >
              {t("form.startImmediately")}
            </label>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>
            {t("form.cancel")}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {t("form.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
