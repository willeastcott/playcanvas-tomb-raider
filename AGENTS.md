# Repository working agreement

## Scope and authoritative material

- Faithfully reconstruct the complete playable 1996 PC demo portion of level 2; never silently expand to the retail game and never substitute a representative or synthetic game.
- The sole archive is `.work/original/TR1PCdemo1.zip`, exactly 2,194,574 bytes with SHA-256 `e0bd2434a6b5005eee5e038c25f294d7ac0d497a3880f463f74266b53fa6bd5b`.
- Authoritative game inputs are that untouched ZIP, its `tombraid/TOMB.EXE` and `tombraid/DATA/LEVEL2.PHD`, and observations made from that exact executable. Verify before use; stop on mismatch.
- Never alter, replace, recompress, redownload, or search for another archive copy. Do not invent a public source.
- Start each task from this file, `PLAN.md`, `STATUS.md`, and only the evidence linked by `STATUS.md`.

## Clean room and proprietary data

- Do not inspect or consult OpenLara, TRX, any other Tomb Raider reimplementation/source port, or material derived from them.
- Systematic static analysis, disassembly, decompilation, debugging, tracing and controlled modification of the exact verified `TOMB.EXE` are authorized after Milestone 0 and are required where needed to recover its behavior. Keep every raw or derived reverse-engineering artifact beneath `.work/`; commit only compact conclusions, address-independent routine IDs, schemas and tests.
- Translate recovered behavior independently into strict TypeScript. Do not embed, execute, mechanically transpile, or ship the original executable or copied proprietary machine-code/decompiler output.
- Maintain an address-independent reconstruction ledger for every demo-reachable routine that affects behavior, rendering or audio: executable evidence, recovered inputs/outputs/side effects/numeric semantics, TypeScript destination, differential tests and acceptance state. The final implementation cannot leave a relevant routine opaque or replace it with a high-level approximation.
- Record each permitted external source and its exact contribution. Label every finding `observed`, `tested`, `inferred`, `uncertain`, or `implementation-specific`.
- Keep archives, extracted data, executables, levels, textures, meshes, animation/audio data, captures, states, dumps, traces, disassembly, comparisons, and temporary downloads under `.work/`. Never commit them.
- Commit only compact metadata, hashes, schemas, tests, synthetic fixtures, assertions, and conclusions. Never paste long proprietary output into documents or task responses.
- The shipped application may fetch or locally open the complete unaltered ZIP, verify it, and decode it in browser memory. It must never ship data derived from the game or execute/embed `TOMB.EXE`.

## Runtime engineering rules

- Write all shipped runtime code independently in strict TypeScript. Use named imports from `playcanvas` and `AppBase`, with PlayCanvas owning graphics setup, scene hierarchy, asset registry, update callbacks, resizing, and teardown.
- PlayCanvas must render the 3D scene. Keep simulation independent of rendering, use a deterministic fixed tick, and clamp/ignore wall-clock gaps according to the tested pause policy.
- Minimise runtime dependencies. Document purpose, version, licence, security review, and why a platform API or small local implementation is insufficient before adding one.
- Preserve the exact demo behavior and presentation. PlayCanvas must reproduce the reference renderer rather than modernize it. The primary visual acceptance target is exact normalized 640×480 framebuffer equality on the frozen reference and browser/GPU profiles; any secondary-platform tolerance must be separately declared and may not weaken the primary gate.
- Do not invent placeholder gameplay, geometry, animation, AI, audio mappings, camera behavior or completion logic. An implementation-specific substitute requires explicit user approval and otherwise blocks the milestone.
- Use the pinned `@playcanvas/eslint-config` TypeScript configuration as the code-style authority. Its PlayCanvas-provided Prettier configuration governs formatting where required by that package; do not introduce a competing formatter/style preset. Every gate runs formatting check, ESLint and strict type-checking.

## Validation and task discipline

- Work on one milestone at a time. A later milestone cannot start until the current gate and stopping condition pass; use one bounded `/goal` per milestone.
- Finish every accepted milestone with a focused checkpoint commit named `milestone N: <outcome>`. Include the gate command/result, principal evidence IDs, and known limitations in its body; stage only milestone-owned, repository-safe files and never unrelated user changes or `.work` material. Preserve these boundary commits for the final technical write-up/social timeline.
- Every milestone must end in a documented local command, review page, playable build or deployed URL that the user can run or inspect. Present that deliverable and its exact launch steps, then wait for explicit user approval; approval precedes the checkpoint commit, and requested changes keep the milestone open.
- Compare in this order: input, tick/time, player, animation, camera, rooms/visibility, collision/triggers, objects/enemies, draw/material state, audio, image. Fix the earliest divergence first.
- Every implemented game behavior must cite executable/data evidence and pass a reference-versus-TypeScript differential test. Internal determinism without reference equality is insufficient.
- Require targeted tests during work and the complete milestone suite only at a gate. After two failed changes based on one hypothesis, gather new instrumentation or run a discriminating experiment before changing code again.
- Do not reopen an accepted finding without contradictory evidence. Prefer experiments that vary one factor and compact tools that filter raw artifacts.
- Keep `STATUS.md` under 100 lines. Before the milestone commit, update it with only the milestone result, verified facts, first failing comparison, reproduction/evidence, blocker, and exact next action.
