# Start New Tunnel Immediately Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a create-only `바로 실행` option that defaults to enabled and starts the tunnel immediately after creation when checked.

**Architecture:** Keep the option as renderer-only transient form state, not persisted tunnel configuration. `TunnelForm` exposes the value through its confirm callback, and `App.handleCreate` starts the newly created tunnel when requested.

**Tech Stack:** Electron, React, TypeScript, Vite.

---

## File Structure

- Modify `src/renderer/src/components/TunnelForm.tsx`: add optional create-only checkbox state and pass `startImmediately` with confirmation.
- Modify `src/renderer/src/App.tsx`: accept the new confirmation boolean and call `startTunnel` after `createTunnel` when true.
- No type changes in `src/main/types.ts` or `src/renderer/src/types/index.ts`: the option is intentionally not persisted.

### Task 1: Create-Only Immediate Start Flow

**Files:**
- Modify: `src/renderer/src/components/TunnelForm.tsx`
- Modify: `src/renderer/src/App.tsx`

- [ ] **Step 1: Check current behavior has no automated test harness**

Run: `bun run build`

Expected before edits: TypeScript and Vite either pass or reveal unrelated baseline issues. There is no configured test script in `package.json`.

- [ ] **Step 2: Update `TunnelForm` props and state**

Change `src/renderer/src/components/TunnelForm.tsx` so the props and state support the create-only option:

```tsx
interface Props {
  initial?: ConfigDraft;
  onConfirm: (config: ConfigDraft, startImmediately: boolean) => void;
  onCancel: () => void;
  title: string;
  showStartImmediately?: boolean;
  defaultStartImmediately?: boolean;
}

export function TunnelForm({
  initial,
  onConfirm,
  onCancel,
  title,
  showStartImmediately = false,
  defaultStartImmediately = true,
}: Props) {
  const [form, setForm] = useState<ConfigDraft>(initial ?? DEFAULT);
  const [startImmediately, setStartImmediately] = useState(
    defaultStartImmediately,
  );
```

- [ ] **Step 3: Pass the immediate-start value on submit**

Change `handleSubmit` in `src/renderer/src/components/TunnelForm.tsx`:

```tsx
  const handleSubmit = () => {
    if (!form.localPort || form.localPort < 1 || form.localPort > 65535) {
      alert("포트 번호는 1~65535 사이여야 합니다.");
      return;
    }
    onConfirm(form, startImmediately);
  };
```

- [ ] **Step 4: Render the create-only checkbox**

In `src/renderer/src/components/TunnelForm.tsx`, add this block after the disposable tunnel checkbox and before the modal footer:

```tsx
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
              바로 실행
            </label>
          </div>
        )}
```

- [ ] **Step 5: Update create handler to start after creation**

Change `handleCreate` in `src/renderer/src/App.tsx`:

```tsx
  const handleCreate = async (
    config: Omit<TunnelConfig, "id">,
    startImmediately: boolean,
  ) => {
    const tunnel = await window.electronAPI.createTunnel(config);
    setTunnels((prev) => [...prev, tunnel]);
    setModal(null);

    if (startImmediately) {
      await window.electronAPI.startTunnel(tunnel.id);
    }
  };
```

- [ ] **Step 6: Update modal props**

Change the create modal in `src/renderer/src/App.tsx`:

```tsx
      {modal?.type === "create" && (
        <TunnelForm
          title="새 터널 추가"
          showStartImmediately
          defaultStartImmediately={true}
          onConfirm={handleCreate}
          onCancel={() => setModal(null)}
        />
      )}
```

Leave the edit modal without `showStartImmediately`, so no immediate-start option appears while editing:

```tsx
      {modal?.type === "edit" && (
        <TunnelForm
          title="터널 수정"
          initial={modal.tunnel.config}
          onConfirm={(config) => handleEdit(modal.tunnel.id, config)}
          onCancel={() => setModal(null)}
        />
      )}
```

- [ ] **Step 7: Verify TypeScript and build**

Run: `bun run build`

Expected: command exits successfully. This verifies renderer build and main process TypeScript compile.

- [ ] **Step 8: Manual behavior check**

Run: `bun run dev`

Expected:
- New tunnel modal shows `바로 실행` checked by default.
- Unchecking `바로 실행` creates a stopped tunnel.
- Leaving `바로 실행` checked creates the tunnel and changes it to starting/running through existing status updates.
- Edit tunnel modal does not show `바로 실행`.

- [ ] **Step 9: Commit**

Only if the user explicitly asks for a commit, run:

```bash
git add docs/superpowers/specs/2026-05-25-start-new-tunnel-immediately-design.md docs/superpowers/plans/2026-05-25-start-new-tunnel-immediately.md src/renderer/src/components/TunnelForm.tsx src/renderer/src/App.tsx
git commit -m "feat: start new tunnels immediately by default"
```

## Self-Review

- Spec coverage: the plan adds a create-only option, defaults it to enabled, avoids persistence, and starts the tunnel after creation when checked.
- Placeholder scan: no TBD/TODO/fill-in placeholders remain.
- Type consistency: `onConfirm(config, startImmediately)` is introduced in `TunnelForm` and consumed by `App.handleCreate`; edit usage remains valid because extra callback parameters are ignored by its inline handler.
