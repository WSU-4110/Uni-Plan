# Uni-Plan

## Architecture

Uni-Plan is built as a **Single Page Application (SPA)** using React + Vite. All navigation and UI updates are handled entirely on the client side via React Router, so the browser never performs a full page reload during normal use.

This architecture inherently satisfies requirement **NR-03 (No Page Reloading)**: interactions such as searching, filtering, and planning all occur within a single continuous session without interrupting the user experience. No additional implementation is needed to meet this requirement.

## Development

- **Node.js 20.19+** is required (Vite 7).
- If you use nvm: run `nvm use` in the project root, then `pnpm dev`.