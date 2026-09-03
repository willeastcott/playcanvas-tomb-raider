# Milestone 0 dependency review

All dependencies are development-only and pinned exactly in `package-lock.json`.

- Node.js 24.18.0 and npm 12.0.1: existing local toolchain used to run the gate. No package is shipped.
- TypeScript 7.0.2, Apache-2.0: strict compilation and static checking for repository tooling. A small local replacement would duplicate a compiler and would not enforce the shipped-code TypeScript policy.
- `@types/node` 24.13.3, MIT: compile-time declarations for the pinned Node major. It has no runtime code.
- DOSBox-X 2026.07.02 commit `6fb8c07`, GPL-2.0-or-later: local-only reference emulator/debugger, retained beneath `.work`; it is neither linked into nor distributed with the application.

Security review: npm packages are fetched from the npm registry with lockfile integrity, have no runtime dependency surface, and are omitted from production output. The DOSBox-X release asset is fetched from the project's official GitHub release, checked against the release-published SHA-256 before extraction, run with a single read-only ZIP mount, no networking, no joystick, muted host audio, and DOSBox-X secure mode after mounting. Raw emulator output remains ignored.
