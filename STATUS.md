# Resume status

## Current checkpoint

- Accepted milestone: **Milestone 0 — authority, evidence and reference freeze**.
- Accepted checkpoint: the root `milestone 0: reference freeze` commit.
- Gate: `npm run gate:m0` — **PASS** on 2026-09-02.
- No later milestone commit, implementation, deployment or accepted behavioral finding exists.

## Verified authority

- Archive: 2,194,574 bytes, SHA-256 `e0bd2434a6b5005eee5e038c25f294d7ac0d497a3880f463f74266b53fa6bd5b`.
- `tombraid/TOMB.EXE`: 442,247 bytes, SHA-256 `e2c33c73c42b14d56986e497ebcb38b7e431cddaec6fb143a647019c5c002b47`.
- `tombraid/DATA/LEVEL2.PHD`: 2,873,406 bytes, SHA-256 `efaae10c309b266b6ad0c27369b9a4e227ae9d62b9aff6d5f8e076a535e83199`.
- [`M0-ARCHIVE`](evidence/M0-ARCHIVE.json): exact archive/entry inventory and hashes.
- [`M0-BOOT`](evidence/M0-BOOT.json): two byte-identical reduced cold-boot traces under `m0-reference-v1`.
- All archive, executable, level, emulator, reverse-engineering, trace and capture material remains beneath ignored `.work/`.

## Required fidelity target

- Systematic analysis of the exact verified executable is required; deterministic approximations and invented placeholder behavior cannot pass.
- The shipped implementation must be independently written in strict TypeScript and use PlayCanvas for rendering.
- Primary visual acceptance is exact normalized equality for all 640×480 game pixels on the frozen reference/browser/GPU profiles.
- Every implemented behavior must cite executable/data evidence and pass ordered reference-versus-candidate differential tests.
- Every demo-reachable executable routine that affects behavior, rendering or audio must be tracked from recovered semantics to independent TypeScript and differential acceptance; no opaque routine or high-level substitute can pass.
- Milestone 1 must pin and configure `@playcanvas/eslint-config` for TypeScript plus its PlayCanvas-provided formatting configuration; all later gates must run format, lint and strict type checks.
- Every milestone now requires a runnable or inspectable approval deliverable and explicit user approval before its checkpoint commit.

## Blocker and exact next action

- Current blocker: none for starting Milestone 1. No shipped game implementation is accepted on `master`.
- Known M0 limitations: full completion tape, concrete completion marker, per-tick state oracle, draw/audio oracle and pixel-repeatability corpus are not established.
- Exact next action: in a new bounded `/goal`, implement only **Milestone 1 — complete executable cartography and reference oracle**. Add the PlayCanvas lint/format baseline, systematically map all demo-reachable `TOMB.EXE` routines into the reconstruction ledger, instrument the complete canonical tape set, deliver `npm run inspect:m1` for user review, and wait for explicit approval before committing `milestone 1: executable oracle`. Write no shipped parser, simulation or renderer.
