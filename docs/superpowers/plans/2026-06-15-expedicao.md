# Expedição Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a manual pedido de saída module for Expedição, independent from OP completion and optionally linked to OP/lote.

**Architecture:** Reuse the existing static ERP shell in `sistema.html`, `css/sistema.css`, `js/sistema.js`, and `js/sistema-2.js`. The module keeps a local `EXPEDICOES` state, renders cards/KPIs/filters, validates manual saída requests, and persists them under each company in Firebase.

**Tech Stack:** Static HTML/CSS/JavaScript, Firebase Realtime Database, PowerShell static tests.

---

### Task 1: Static Test Contract

**Files:**
- Modify: `tests/user-flow-static.test.ps1`

- [ ] Add assertions that Expedição has a real view, modal, status filters, local JS functions, Firebase functions, and no "Em breve" placeholder.
- [ ] Run `powershell -ExecutionPolicy Bypass -File tests/user-flow-static.test.ps1`.
- [ ] Confirm it fails because the Expedição module is not implemented yet.

### Task 2: Desktop UI

**Files:**
- Modify: `sistema.html`
- Modify: `css/sistema.css`

- [ ] Replace the `view-expedicao` placeholder with KPI cards, filter controls, action button, cards container, and empty state.
- [ ] Add an `expedicaoModal` form for manual pedido de saída with codigo, destino, produto, quantidade, unidade, transportadora, previsão, OP/lote optional, and observation.
- [ ] Add compact grid/card styles that match the existing ERP shell.

### Task 3: Local Module Logic

**Files:**
- Modify: `js/sistema.js`

- [ ] Add `EXPEDICOES`, active filter state, status metadata, validation, render helpers, modal open/close handlers, and status transitions.
- [ ] Ensure manual requests do not require OP data.
- [ ] Keep OP/lote as optional text only.

### Task 4: Firebase Integration

**Files:**
- Modify: `js/sistema-2.js`

- [ ] Normalize `raw.expedicoes` into `EXPEDICOES`.
- [ ] Expose `firebaseSalvarExpedicao` and `firebaseAtualizarStatusExpedicao`.
- [ ] Save records under `empresas/{token}/expedicoes`.
- [ ] Add history entries when status changes.

### Task 5: Mobile Consistency

**Files:**
- Modify: `mobile_qr/index.html`
- Modify: `mobile_qr/js/sistema.js`
- Modify: `mobile_qr/css/mobile-demo.css`

- [ ] Replace the mobile placeholder with a compact read/advance flow or a clear reduced operator view.
- [ ] Keep status labels and filters consistent with desktop.

### Task 6: Verification

**Files:**
- Use: `tests/user-flow-static.test.ps1`

- [ ] Run the static test until green.
- [ ] Serve the project locally and verify `sistema.html` loads without console errors.
- [ ] Check the Expedição menu opens the real module and the create modal is reachable.
