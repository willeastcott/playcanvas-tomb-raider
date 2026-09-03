# Faithful Tomb Raider PC demo reconstruction

This repository targets a faithful strict-TypeScript reconstruction of the complete playable level-2 portion in the 1996 PC demo. Behavior is recovered from the exact verified `TOMB.EXE`; original data is decoded from the verified ZIP at runtime; PlayCanvas owns rendering and must match the frozen reference framebuffer exactly on the primary profile. Other Tomb Raider implementations are prohibited.

Milestone 0 contains governance, compact evidence contracts, and local reference tooling only. No shipped archive reader, level parser, simulation, renderer, audio, UI or gameplay implementation is accepted yet.

Run `npm ci`, `npm run reference:m0`, then `npm run gate:m0` from the repository root. The reference command requires the separately supplied verified archive and pinned DOSBox-X binary at the paths frozen in `records/reference-config.json`.
