# Expedição Conferência e Romaneio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add quantity conference and a printable romaneio/resumo to the manual Expedição module.

**Architecture:** Extend the existing `EXPEDICOES` state and Firebase records with conference fields. The desktop card opens a conference modal when a pedido is in `conferencia`, blocks `pronto` until conference exists, and opens a romaneio modal for printable output. Mobile remains read-focused and shows expected/conferred quantities.

**Tech Stack:** Static HTML/CSS/JavaScript, Firebase Realtime Database, PowerShell static tests, browser verification.

---

### Task 1: Test Contract

**Files:**
- Modify: `tests/user-flow-static.test.ps1`

- [ ] Add assertions for `expedicaoConferenciaModal`, `expedicaoRomaneioModal`, `quantidadeConferida`, `registrarConferenciaExpedicao`, `abrirRomaneioExpedicao`, and Firebase conference persistence.
- [ ] Run `powershell -ExecutionPolicy Bypass -File tests/user-flow-static.test.ps1`.
- [ ] Expected: failure because the conference and romaneio UI/functions do not exist yet.

### Task 2: Desktop UI

**Files:**
- Modify: `sistema.html`
- Modify: `css/sistema.css`

- [ ] Add conference modal with expected quantity, conferred quantity, responsible note, and divergence message.
- [ ] Add romaneio modal with pedido metadata, expected/conferred quantities, divergence, destination, carrier, OP/lote, observation, and print button.
- [ ] Add compact CSS for conference highlights, divergence badges, and print-friendly romaneio.

### Task 3: Local JavaScript

**Files:**
- Modify: `js/sistema.js`

- [ ] Add `abrirConferenciaExpedicao`, `registrarConferenciaExpedicao`, `expedicaoConferida`, `expedicaoTemDivergencia`, `abrirRomaneioExpedicao`, and `imprimirRomaneioExpedicao`.
- [ ] Change status flow so `conferencia` opens the conference modal and `pronto` is only allowed after conference.
- [ ] Show expected/conferred quantities and divergence status on each card.

### Task 4: Firebase

**Files:**
- Modify: `js/sistema-2.js`

- [ ] Normalize conference fields from `raw.expedicoes`.
- [ ] Add `firebaseRegistrarConferenciaExpedicao`.
- [ ] Persist `quantidadeConferida`, `conferidoPor`, `conferidoEm`, `divergencia`, and history entries.

### Task 5: Mobile Read View

**Files:**
- Modify: `mobile_qr/js/sistema.js`
- Modify: `mobile_qr/js/demo-sem-login.js`
- Modify: `mobile_qr/css/mobile-demo.css`

- [ ] Show expected and conferred quantities on mobile cards.
- [ ] Add demo records with conference state so presentation shows the feature.

### Task 6: Verification

**Files:**
- Use: `tests/user-flow-static.test.ps1`

- [ ] Run the static test until green.
- [ ] Run `node --check` for edited JavaScript files.
- [ ] Verify the local mobile route renders Expedição with no console errors.
