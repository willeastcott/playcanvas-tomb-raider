# Frozen Milestone 0 reference tooling

Finding status: **implementation-specific**. DOSBox-X is a measurement environment, not evidence that its timing or rasterization matches original hardware.

The pinned debugger-enabled DOSBox-X MinGW SDL2 build runs the exact archive as a read-only mounted ZIP. This preserves the complete unaltered distribution without extracting support files. Only `TOMB.EXE` and `LEVEL2.PHD` are separately extracted under `.work` for identity checks. The debugger is available for later bounded experiments but is not used for semantic binary or PHD analysis in Milestone 0.

Instrumentation uses DOSBox-X's bounded log categories and `tools/m0/reduce-boot-log.ts`. The reducer retains only emulator identity, mount/execute transitions, the 4:3 output decision, discrete surface sizes, and the guest mode-reset marker. It discards cycle counters, timestamps, host paths, and raw output. `tools/reference/run-boot-smoke.ps1` verifies the archive and emulator hashes before each campaign, performs two cold boots with the frozen no-input tape, stops after the exact boot-completion marker, and writes raw logs and reduced traces only beneath `.work`.

The reference machine, guest date/time, CPU abstraction, graphics, viewport, audio, bindings, input sampling assumptions, markers, and limitations are frozen in `records/reference-config.json`. The full demo-completion marker is an operational scope boundary and is explicitly `uncertain` until a later completion-path experiment reaches it; Milestone 0 does not infer level semantics or construct that route.
