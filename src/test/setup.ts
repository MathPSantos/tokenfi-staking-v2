import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// // Extend Vitest's expect method with methods from react-testing-library
// expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
