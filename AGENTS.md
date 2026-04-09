# Developer & Agentic Instructions (AGENTS.md)

This document provides behavioral guidelines, code style preferences, and operational rules for human engineers and agentic coding agents operating in the `TryCloudflareGUI` repository.

## 1. Project Overview

`TryCloudflareGUI` is an Electron-based desktop application providing a GUI for managing TryCloudflare tunnels.
- **Stack:** Electron, React, TypeScript, Vite.
- **Architecture:** 
  - Main Process (`src/main/`): Node.js environment, handles file system, processes, and Electron window management.
  - Renderer Process (`src/renderer/`): Browser environment, handles the React UI.
  - Preload Script (`src/main/preload.ts`): Bridges Main and Renderer securely via `contextBridge`.

## 2. Execution Guidelines (Karpathy Guidelines)

When operating in this codebase, agents must strictly adhere to the following principles:

1. **Think Before Coding:** Explicitly state assumptions. Clarify ambiguities before writing code.
2. **Simplicity First:** Write the minimum code necessary to solve the exact problem. Avoid premature abstractions and "future-proofing". If an implementation spans 200 lines but could be 50, rewrite it.
3. **Surgical Changes:** Modify *only* what is necessary for the current task. Do not reformat unrelated code or refactor neighboring functions unless explicitly requested. Clean up dead code *only* if your changes created it.
4. **Goal-Driven Execution:** Define clear, verifiable success criteria before acting. When fixing a bug or adding a feature, state the plan and verify step-by-step.

## 3. Scripts and Commands

Since this is an Electron + Vite application, here are the primary commands for building, running, and (future) testing:

### Running the App
- **Development Mode:** `npm run dev` (Starts Vite dev server and the Electron app concurrently).
- **Vite Dev Server:** `npm run dev:vite`
- **Electron Watcher:** `npm run dev:electron`

### Building the App
- **Build All:** `npm run build` (Builds Vite renderer and TypeScript main process).
- **Build Main Process Only:** `npm run build:main`
- **Package Electron App:** `npm run build:electron` (Uses `electron-builder` to package into executables for the target OS).

### Testing (Convention)
*Note: A formal test runner is not yet configured in `package.json`, but when implemented (e.g., Vitest or Jest), adhere to these standards:*
- **Run All Tests:** `npm run test`
- **Run a Single Test:** `npm run test -- <path-to-test-file>` or `npx vitest run <path-to-test-file>`
- **Test Locations:** Co-locate tests with their respective files (e.g., `TunnelForm.test.tsx` next to `TunnelForm.tsx`) or in a dedicated `__tests__` folder.
- **Test Execution:** Before committing any significant logic changes, agents *must* verify changes by running tests.

### Linting & Formatting (Convention)
- **Check types:** `tsc -p tsconfig.main.json --noEmit` and `tsc -p tsconfig.json --noEmit`
- Agents should use `npx eslint . --ext .ts,.tsx` or `npx prettier --write .` if installed, otherwise strictly match the existing indentation and styling.

## 4. Code Style & Architecture Guidelines

### 4.1. TypeScript & Typing
- **Strict Typing:** Avoid `any`. Always define explicit types or interfaces in `src/renderer/src/types/` or `src/main/types.ts`.
- **Return Types:** Explicitly define return types for complex functions and all exported Main process handlers.
- **Nullability:** Handle `null` and `undefined` safely using optional chaining (`?.`) and nullish coalescing (`??`).

### 4.2. Imports and File Structure
- **Absolute vs Relative:** Use relative imports for local folder components (e.g., `./components/Button`). Avoid deep relative imports (`../../../../`); consider defining path aliases in `tsconfig.json` and `vite.config.ts` if paths get too deep.
- **Separation of Concerns:** 
  - `src/main/`: No DOM or React imports.
  - `src/renderer/`: No Node.js built-in modules (`fs`, `path`, `child_process`) or Electron modules. All system interactions *must* go through the `window.api` bridge defined in `preload.ts`.
- **Preload Types:** Ensure any new IPC channels are typed in `src/renderer/src/types/electron.d.ts`.

### 4.3. Formatting & Naming Conventions
- **Naming:**
  - Files: PascalCase for React components (`TunnelCard.tsx`), camelCase for utilities/main process files (`tunnelManager.ts`).
  - Variables/Functions: camelCase.
  - Interfaces/Types: PascalCase.
  - Constants: UPPER_SNAKE_CASE.
- **Indentation:** 2 spaces. No tabs.
- **Quotes:** Use single quotes for strings in TS/JS files, double quotes for JSX attributes and JSON.
- **Semicolons:** Use semicolons at the end of statements.

### 4.4. Error Handling
- **Main Process:** Wrap IPC handlers in `try/catch`. Never let the main process crash due to an unhandled rejection. Use standard Error objects and pass descriptive error messages back to the renderer.
- **Renderer Process:** Gracefully handle errors returned from IPC calls. Display user-friendly error messages (e.g., via a toast or error banner) rather than silently failing or dumping stack traces into the UI.
- **Promises:** Prefer `async/await` over `.then().catch()`.

### 4.5. React specific Guidelines
- **Functional Components:** Use Functional Components with React Hooks. Avoid Class Components.
- **State Management:** Keep state as local as possible. Lift state up only when necessary.
- **Side Effects:** Clean up resources (e.g., intervals, event listeners) in `useEffect` return functions.

## 5. Electron Specific Rules

- **IPC Security:** Never expose `ipcRenderer.send` or `ipcRenderer.invoke` directly to the window object. Always wrap them in specific, strongly-typed functions inside `preload.ts`.
- **Node Integration:** Node integration must remain `false` in `BrowserWindow` webPreferences. Context Isolation must be `true`.
- **External Links:** Handle external link clicks (e.g., `target="_blank"`) in the main process (`webContents.setWindowOpenHandler`) to open in the user's default browser, not a new Electron window.

## 6. Self-Verification Loop

Agents executing tasks must follow this loop:
1. **Understand:** Read relevant files (`package.json`, `main.ts`, `App.tsx`, etc.).
2. **Plan:** Formulate a minimal, surgical change plan.
3. **Execute:** Modify the files.
4. **Verify:** Check for TypeScript compilation errors (`tsc -p tsconfig.main.json --noEmit`). If UI changes are made, ideally verify visually or via UI tests if available.
5. **Finalize:** Clean up any temporary debug logs before finishing the task.
