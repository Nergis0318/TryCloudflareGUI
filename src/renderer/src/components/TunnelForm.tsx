import { useState } from "react";
import { TunnelConfig } from "../types";

type ConfigDraft = Omit<TunnelConfig, "id">;

interface Props {
  initial?: ConfigDraft;
  onConfirm: (config: ConfigDraft) => void;
  onCancel: () => void;
  title: string;
}

const DEFAULT: ConfigDraft = {
  name: "",
  localHost: "localhost",
  localPort: 3000,
  protocol: "http",
  isDisposable: true,
};

export function TunnelForm({ initial, onConfirm, onCancel, title }: Props) {
  const [form, setForm] = useState<ConfigDraft>(initial ?? DEFAULT);

  const set = (key: keyof ConfigDraft, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.localPort || form.localPort < 1 || form.localPort > 65535) {
      alert("포트 번호는 1~65535 사이여야 합니다.");
      return;
    }
    onConfirm(form);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>

        <div className="form-group">
          <label>이름 (선택)</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="내 터널"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>프로토콜</label>
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
            <label>로컬 호스트</label>
            <input
              value={form.localHost}
              onChange={(e) => set("localHost", e.target.value)}
              placeholder="localhost"
            />
          </div>
        </div>

        <div className="form-group">
          <label>포트</label>
          <input
            type="number"
            min={1}
            max={65535}
            value={form.localPort}
            onChange={(e) => set("localPort", parseInt(e.target.value) || 0)}
            placeholder="3000"
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
            일회용 터널 (앱 종료 시 저장 안함)
          </label>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>
            취소
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
