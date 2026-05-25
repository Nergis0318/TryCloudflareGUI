# Start New Tunnel Immediately Design

## Goal

When adding a new tunnel, show a `바로 실행` option that is enabled by default. If the user confirms the form while the option is enabled, the app creates the tunnel and immediately starts it.

## Scope

- Show the option only in the new tunnel creation flow.
- Do not show or store this option when editing an existing tunnel.
- Do not add a persisted `autoStart` field to `TunnelConfig`.
- Keep existing tunnel persistence and disposable tunnel behavior unchanged.

## UI Behavior

`TunnelForm` will support an optional create-only checkbox. The create modal passes props that display the checkbox with a default checked value. The edit modal does not pass those props, so the form remains unchanged for editing.

## Data Flow

The form confirmation callback will include the tunnel config and a `startImmediately` boolean. `App.handleCreate` will call `createTunnel(config)`, add the returned tunnel to renderer state, close the modal, and call `startTunnel(tunnel.id)` when `startImmediately` is true. Live status updates continue to arrive through the existing `onTunnelUpdated` subscription.

## Error Handling

Creation keeps the current behavior. If immediate start fails, the error propagates through the existing IPC call path; no new user-facing error UI is added in this change.

## Testing

Verify TypeScript compilation for renderer and main process. Manually inspect the form logic by confirming that the option appears only for creation, defaults to checked, and the edit form has no new option.
