"use client"

import { RuntimeLoader } from "@rive-app/react-canvas"

// Serve WASM from the installed package (always version-matched). Turbopack emits
// a static asset URL via new URL(..., import.meta.url).
RuntimeLoader.setWasmUrl(
  new URL("@rive-app/canvas/rive.wasm", import.meta.url).href
)

export * from "@rive-app/react-canvas"
