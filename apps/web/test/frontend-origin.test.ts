import assert from "node:assert/strict";
import { test } from "node:test";
import { frontendOrigin } from "../lib/frontend-origin";

test("uses the public domain behind an internal reverse-proxy address", () => {
  assert.equal(
    frontendOrigin("http://localhost:8888", "https://aura-atlas.netlify.app/"),
    "https://aura-atlas.netlify.app",
  );
});

test("keeps the local origin when a public domain is not configured", () => {
  assert.equal(
    frontendOrigin("http://localhost:3001", ""),
    "http://localhost:3001",
  );
});

test("does not accept unrelated origins as the configured public domain", () => {
  const expected = frontendOrigin(
    "http://localhost:8888",
    "https://aura-atlas.netlify.app",
  );
  assert.notEqual(expected, "https://attacker.example");
  assert.notEqual(expected, "https://aura-atlas.netlify.app.attacker.example");
  assert.notEqual(expected, "http://aura-atlas.netlify.app");
});

test("rejects non-HTTP configuration and embedded credentials", () => {
  assert.throws(() =>
    frontendOrigin("http://localhost:8888", "file:///tmp/test"),
  );
  assert.throws(() =>
    frontendOrigin(
      "http://localhost:8888",
      "https://user:password@example.org",
    ),
  );
});
