# Faithful Tomb Raider PC demo reconstruction plan

This plan’s final deliverable is the complete, functionally and visually near-identical playable game contained in the supplied 1996 PC demo ZIP. “Faithful” means that the independently written TypeScript implementation reproduces the verified executable’s behavior, timing and presentation—not merely a similar-looking level, representative scene, data viewer or deterministic approximation. Intermediate inspectors are approval instruments, never substitutes for the final game. Other Tomb Raider implementations and information derived from them remain forbidden.

## 1. Non-negotiable outcome

- Recover the demo’s actual behavior from the exact verified `TOMB.EXE` through systematic static and dynamic analysis.
- Classify every demo-reachable executable routine that affects behavior, rendering or audio, recover its observable contract and numeric/control-flow semantics, and trace it to independently written TypeScript and reference-differential tests.
- Decode game data from the complete verified ZIP in browser memory; never ship derived game assets or execute/embed the EXE.
- Implement recovered behavior in strict TypeScript with simulation independent of rendering.
- Use PlayCanvas `AppBase` and named Engine imports for graphics ownership, scene lifecycle and presentation.
- Match the complete demo path: boot/title/loading, player controls, animation, camera, rooms, collision, triggers, objects, enemies, combat, inventory/HUD, audio, death/restart and completion.
- Produce exact normalized 640×480 framebuffer equality on the frozen primary browser/GPU profile. Secondary platforms may have separately measured tolerances but cannot redefine “pixel accurate” or weaken the primary gate.
- Never accept an implementation-specific stand-in without explicit user approval.
- End every milestone with a concrete runnable/inspectable deliverable and explicit user approval, not only an automated green test.

## 2. Authority and scope

The sole authority is `.work/original/TR1PCdemo1.zip`, exactly 2,194,574 bytes with SHA-256 `e0bd2434a6b5005eee5e038c25f294d7ac0d497a3880f463f74266b53fa6bd5b`, its `tombraid/TOMB.EXE`, its `tombraid/DATA/LEVEL2.PHD`, archive-internal documentation, and controlled observations from that executable. Scope ends at the demo’s own completion boundary and excludes retail levels and unreachable retail systems.

The root `milestone 0: reference freeze` checkpoint remains accepted. No later milestone implementation or behavioral finding exists on the accepted branch; all later conclusions must be established from the exact executable under this plan.

## 3. Reverse-engineering policy

After hash verification, systematic disassembly, decompilation, debugging, watchpoints, breakpoints, memory traces, file-access traces, controlled binary patches and capture instrumentation of the exact EXE are permitted. Every raw executable, listing, decompiler database, symbol map with addresses, dump, patch, trace, state, capture and comparison stays beneath `.work/` and is never committed.

Committed evidence may contain only compact address-independent routine IDs, field meanings, pseudocode-level conclusions, hashes, numeric contracts, schemas and assertions. Shipped code must be an independent TypeScript expression of the recovered algorithms; it must not contain copied assembly, machine code, large decompiler output or proprietary data.

Every finding is labelled `observed`, `tested`, `inferred`, `uncertain`, or `implementation-specific`. A routine or behavior is `tested` only after a controlled experiment distinguishes it from plausible alternatives. Two failed implementation changes under one hypothesis require new instrumentation before another code change.

## 4. Executable-to-TypeScript transformation

Maintain one compact reconstruction ledger keyed by stable, address-independent routine ID. For every routine reachable from the canonical boot, control, death/restart and completion tapes, record its executable fingerprint, callers/callees, inputs/outputs, global and structure accesses, side effects, ordering/timing role, fixed-width arithmetic/overflow/rounding rules, controlled evidence, confidence, TypeScript destination and differential-test IDs. Dynamic coverage is combined with the static call graph so untaken but demo-reachable branches are not missed; unreachable retail-only code is explicitly excluded with evidence.

Transform each subsystem through the same gate: locate and bound executable routines; recover control flow and data semantics; run discriminating experiments; write a compact behavioral contract; independently express that contract in strict TypeScript; compare it against the exact executable at routine/state-machine and integrated levels; mark it accepted only when the declared differential scope matches. Ledger states are `unmapped`, `mapped`, `specified`, `translated`, `differentially-accepted`, or `excluded-with-evidence`. Mechanical binary translation is forbidden, but complete semantic reconstruction of demo-reachable game code is required.

## 5. Reference oracle

The reference harness is a first-class oracle, not a screenshot sampler. It must replay versioned input tapes from deterministic start conditions and capture, for each game tick and presented frame where obtainable:

- sampled input and tick/time counters;
- global mode and random state;
- player position, orientation, velocity, animation/state/frame and health;
- camera mode, transform, target and projection state;
- active room, portal/visibility set and collision query/result;
- trigger, object, enemy, weapon, projectile and inventory state;
- ordered draw/material/texture/palette state and framebuffer hash;
- ordered audio commands and mixed-output hash.

At least two reference runs must be byte-identical after reduction before their output becomes a golden oracle. Raw traces and captures stay under `.work`; committed records contain bounded summaries and hashes. The canonical tape set must include no-input boot, title/menu transitions, every control, locomotion/collision sweeps, interactions, every completion-path encounter, death/restart and full completion.

## 6. Architecture

The shipped path is `source -> exact SHA-256 gate -> bounded in-memory ZIP -> complete demo-data model -> deterministic executable-faithful simulation -> immutable snapshots -> PlayCanvas renderer / Web Audio / DOM accessibility shell`.

- `src/acquisition` and `src/archive`: exact byte authority and bounded ZIP access.
- `src/format` and `src/game-data`: checked decoding with source offsets and explicit unknowns.
- `src/sim`: recovered fixed-tick state and algorithms; no DOM, Web Audio or PlayCanvas imports.
- `src/render`: PlayCanvas adapter reproducing original transforms, clipping, visibility, palette/texture sampling, draw order and raster rules.
- `src/audio`: recovered event selection, parameters and timing; platform scheduling remains an adapter.
- `src/app`: sole `AppBase` composition root and lifecycle owner.
- `tools/reference`, `tools/reverse`, and `tools/compare`: local-only oracle instrumentation, reducers and earliest-divergence reports.

Dependencies flow inward. Rendering and wall-clock callbacks cannot determine simulation state. Unknown or unverified behavior fails explicitly rather than silently selecting a convenient default.

## 7. Pixel-accuracy contract

The frozen reference surface is 640×480 VESA mode `0x69`, full-frame, 4:3, with no crop or internal letterbox. Reference captures are normalized by one versioned lossless procedure before comparison. The primary PlayCanvas profile freezes browser, Engine, GPU/driver, canvas/backbuffer size, device-pixel ratio, color space, alpha mode and capture method.

The renderer must emulate the original presentation rules as evidence establishes them, including integer/fixed-point transforms, viewport reduction, clipping, depth/ordering, texture addressing, palette/color conversion, transparency, sprites, UI composition and frame pacing. Custom PlayCanvas shaders and quantized intermediate targets are allowed. Modern lighting, filtering, antialiasing, post-processing and interpolation are off unless the executable proves them.

Primary-profile acceptance is zero differing normalized pixels for every designated golden frame and every frame of the final canonical full-demo tape. Masks may exclude only emulator chrome outside the 640×480 guest surface; they may never hide game pixels. A mismatch blocks downstream work even when a perceptual metric looks close.

## 8. Differential validation

Compare in this strict order: input; tick/time; global/random state; player; animation; camera; rooms/visibility; collision/triggers; objects/enemies; draw/material state; audio commands; mixed audio; framebuffer. Fix the earliest divergent tick and field first. Candidate-only determinism is necessary but never sufficient.

Each report gives the reference/candidate run IDs, exact authority/configuration hashes, first divergent tick/frame, bounded surrounding values, raw artifact paths beneath `.work`, and one conclusion. No milestone can pass with an unexplained divergence inside its declared scope.

## 9. Proprietary-data boundary

Archives, extracted files, executable analysis, decompiler projects, decoded assets, captures, traces, dumps, states and generated comparisons remain below `.work/`. Commits contain tools, schemas, synthetic fixtures, compact evidence and independently written source only. Gates scan repository and release outputs for known hashes, executable/archive signatures, game-data extensions, large generated blobs, source maps, workspace paths and secrets.

## 10. PlayCanvas code style and formatting

Starting in Milestone 1, pin the audited PlayCanvas ESLint package and make it the single style authority for all JavaScript and TypeScript. The current planning baseline is `@playcanvas/eslint-config@3.0.0-beta.8` with ESLint 9 because its official package exports `/typescript` and `/prettier`; verify the dist-tag again before installation and never float a beta version. Use the TypeScript flat config for linting, its PlayCanvas-provided Prettier config for the separate formatting pass, and expose `format`, `format:check`, `lint`, `lint:fix` and `typecheck` scripts. Every targeted test and milestone gate must run `format:check`, lint and strict type-checking before behavioral or visual validation.

Permitted external sources used by this planning revision: the official [PlayCanvas ESLint package metadata](https://www.npmjs.com/package/@playcanvas/eslint-config) contributed current versions, peer requirements and exports; the official [PlayCanvas v3 rollout guidance](https://github.com/playcanvas/eslint-config/issues/48) contributed the `/typescript` import and separate `/prettier` formatting rule. Neither source contributed Tomb Raider behavior or implementation information.

## 11. Milestone discipline

Milestones are serial and each gets a separate bounded `/goal`. Each milestone defines an approval deliverable and one exact command or URL. After its automated gate passes, present the deliverable with a short review checklist and wait for explicit user approval. Only then update `STATUS.md` under 100 lines, audit the staged data boundary, and create exactly one focused `milestone N: <outcome>` commit whose body lists the gate result, approval, principal evidence IDs and known limitations. A rejection keeps the milestone active. Later work cannot reinterpret an accepted result without contradictory evidence and an explicit supersession record.

### Milestone 0 — authority, evidence and reference freeze — accepted

The root checkpoint freezes archive/entry hashes, the DOSBox-X reference profile, schemas, source register, no-input boot tape, markers and two matching reduced boot traces. It contains no shipped game implementation. Its remaining limitation is that full-demo state/frame/audio oracle capture is not yet established.

- **Approval deliverable:** `npm run gate:m0` plus `evidence/M0-ARCHIVE.json` and `evidence/M0-BOOT.json`; already run, inspected and accepted by the existing milestone commit.

### Milestone 1 — complete executable cartography and reference oracle

- **Objective:** classify all demo-reachable code in the exact EXE and produce the repeatable oracle and reconstruction ledger needed to translate it to TypeScript.
- **Work:** install the PlayCanvas lint/format baseline; pin licensed static-analysis tooling; identify DOS/4GW image/relocation structure; combine static call graphs with dynamic coverage; create stable routine IDs and ledger entries; map all reachable boot, main-loop, timer/input, load, simulation, collision, animation, AI/combat, inventory/UI, renderer and audio paths; build bounded debugger hooks; create canonical tapes including alternate controls, death/restart and verified full completion.
- **Excluded:** shipped archive parser, simulation, PlayCanvas renderer and gameplay implementation.
- **Gate:** `npm run gate:m1` verifies hashes, provenance, analysis-tool versions, routine-map coverage, tape schemas, concrete start/completion markers, and two identical reduced reference runs for every canonical tape.
- **Approval deliverable:** `npm run inspect:m1` starts a local read-only oracle/cartography viewer showing routine coverage, ledger status, input tapes, state/draw/audio timelines, repeatability results and playable reference captures from `.work` without exposing raw artifacts.
- **Acceptance/stop:** every demo-reachable behavior/render/audio routine is mapped or excluded with evidence, every later subsystem has an observation seam, the full reference completion can be replayed and inspected, and the user explicitly approves the viewer. Then commit `milestone 1: executable oracle` and stop before shipped runtime implementation.

### Milestone 2 — exact acquisition and complete demo-data decoding

- **Objective:** decode every archive and `LEVEL2.PHD` structure read by the executable during the full canonical tape.
- **Work:** implement exact source/hash/ZIP handling and checked TypeScript data decoders; correlate each field/table with executable reads and consumers; preserve raw integer semantics and unknown spans; cover all rooms, textures/palettes, meshes, animations, items, collision/floor data, triggers, sprites and audio required by the demo.
- **Excluded:** simulation behavior and PlayCanvas rendering.
- **Gate:** `npm run gate:m2` compares decoded counts, offsets, identities and cross-references against the executable oracle; bounds/fuzz tests cover every decoder; no completion-path read is unexplained.
- **Approval deliverable:** `npm run inspect:m2` opens a local browser data explorer that requests the verified ZIP and lets the user inspect every decoded room, texture/palette, mesh, hierarchy, animation, item, collision/trigger, sprite and audio record with source offsets and evidence links.
- **Acceptance/stop:** exact equality for all decoded/discrete values used by demo-reachable code, explicit provenance for every semantic field, and user approval of the explorer. Then commit `milestone 2: exact demo data`.

### Milestone 3 — pixel-exact PlayCanvas renderer

- **Objective:** reproduce the reference framebuffer from oracle state and exact decoded data before implementing gameplay simulation.
- **Work:** build the `AppBase` shell, PlayCanvas buffers/materials/shaders, camera/projection, room/portal submission, model hierarchy/poses, sprites and UI composition; replay captured oracle state locally without committing proprietary replay data.
- **Excluded:** candidate gameplay decisions, collision, AI and combat.
- **Gate:** `npm run gate:m3` requires exact normalized 640×480 pixel equality on the primary profile for title/loading, representative room/camera/animation/UI states, transition edges and every designated golden frame. Structural equality alone cannot pass.
- **Approval deliverable:** `npm run inspect:m3` starts a PlayCanvas oracle-state viewer with reference, candidate, blink/split and amplified-difference views, frame/tick navigation, render-state inspection and the exact local commands needed to reproduce any mismatch.
- **Acceptance/stop:** zero differing primary-profile pixels for the declared replay corpus, evidence for every render rule, and explicit user visual approval. Then commit `milestone 3: pixel-exact reference renderer`.

### Milestone 4 — executable-faithful engine core

- **Objective:** reproduce timing, input, random state, player locomotion, animation, camera, visibility, collision and triggers through the first enemy activation.
- **Work:** translate recovered routines and numeric/rounding behavior into pure fixed-tick TypeScript; add exact state serialization and earliest-divergence tooling.
- **Gate:** `npm run gate:m4` compares every tick and frame of the core tape set. All upstream state must be exact; rendered frames must remain pixel exact.
- **Approval deliverable:** `npm run demo:m4` launches the real PlayCanvas build from the verified local ZIP, playable from the canonical level start through first enemy activation, with an optional live reference/candidate state and pixel-diff panel.
- **Acceptance/stop:** no unexplained difference through first enemy activation, all relevant routine-ledger entries differentially accepted, and user approval of the playable slice. Then commit `milestone 4: exact engine core`.

### Milestone 5 — executable-faithful objects, enemies and combat

- **Objective:** reproduce every completion-path object, enemy, weapon, projectile, damage, death, inventory and HUD behavior.
- **Work:** translate the mapped executable state machines in encounter order; include actual activation, targeting, AI/randomness, health/damage and item rules.
- **Gate:** `npm run gate:m5` compares every tick/event/frame for encounter, death/restart and completion-path tapes; no synthetic timing, health values or animation choices are permitted.
- **Approval deliverable:** `npm run demo:m5` launches a locally playable completion path with recovered objects, enemies, combat, inventory and HUD; systems reserved for M6 are visibly marked unavailable rather than replaced with placeholders, and the differential panel remains available.
- **Acceptance/stop:** exact state/event equality and pixel-exact frames through the completion trigger, corresponding routine-ledger entries accepted, and user approval of the playable build. Then commit `milestone 5: exact playable demo`.

### Milestone 6 — audio and complete lifecycle equivalence

- **Objective:** reproduce boot/title/loading, pause/inventory, focus policy, reachable sound/music, completion and restart as one exact local demo loop.
- **Work:** recover executable audio selection/parameters/ticks and lifecycle state transitions; decode original audio only from verified runtime bytes; implement platform adapters without changing simulation timing.
- **Gate:** `npm run gate:m6` requires two exact full local runs, exact reduced state/draw/audio-command traces, exact primary-profile frame sequence, and versioned mixed-audio comparison justified against repeat-reference variance.
- **Approval deliverable:** `npm run demo:m6` launches the complete local browser demo from ZIP selection, including boot/title/loading, full play, audio, pause/inventory, death/restart and completion; `npm run inspect:m6` opens its full-run differential report.
- **Acceptance/stop:** no known functional or visual divergence, exact audio commands, bounded waveform variance if unavoidable, all demo-reachable routine-ledger entries accepted, and explicit user approval of a complete playthrough and report. Then commit `milestone 6: faithful complete demo`.

### Milestone 7 — data-clean release and deployed equivalence

- **Objective:** publish the already accepted faithful implementation without changing behavior.
- **Work:** evaluate an HTTPS/CORS source, obtain explicit human approval, configure fail-closed automatic acquisition, build/audit Pages and deploy. The current Icedrive referrer is not approved; any concrete candidate must be submitted and evaluated anew.
- **Gate:** `npm run validate` repeats all prior gates from a clean clone, scans the bundle for proprietary/derived data, and runs the complete canonical comparison against the deployed build on the primary profile plus the supported-browser matrix.
- **Approval deliverable:** the deployed Pages URL plus `npm run inspect:m7`, which shows clean-clone/build/proprietary-scan results and deployed-versus-local full-run comparisons with reproduction links.
- **Acceptance/stop:** deployed output is behaviorally and pixel identical to the approved local build, acquisition checksum passes, the release audit has no unexplained difference, and the user approves the deployed playthrough and report. Then commit `milestone 7: faithful public release`.

## 12. Final acceptance

The project is complete only when the verified archive can drive the entire original demo path in the browser; every demo-reachable behavior/render/audio routine is mapped and its relevant semantics are independently represented in TypeScript or excluded with evidence; every game-system outcome matches the exact executable oracle; every primary-profile canonical frame matches all 640×480 pixels; audio commands match exactly and waveform variance, if any, is explicitly bounded and approved; two complete runs repeat; the application uses PlayCanvas for rendering; PlayCanvas formatting/lint/type gates pass; no proprietary or reverse-engineering artifact is committed or deployed; the user has run or inspected and explicitly approved every milestone deliverable; and all eight milestone checkpoint commits exist on the accepted branch.
