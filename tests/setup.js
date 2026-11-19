import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
// Node 26 exposes an unset native storage property which Vitest preserves.
// Use this test environment's real jsdom Storage instead of a mock.
if (typeof window !== "undefined" && !window.localStorage) {
  Object.defineProperty(window, "localStorage", {
    value: globalThis.jsdom.window.localStorage,
    configurable: true,
  });
}

afterEach(cleanup);
