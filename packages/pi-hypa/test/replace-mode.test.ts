import test from "node:test";
import assert from "node:assert/strict";
import { applyReplaceModeFilter } from "../extensions/index.js";

test("replace mode filter removes all default disabled builtins", () => {
  const tools = ["bash", "read", "grep", "find", "ls", "hypa_shell", "hypa_read", "hypa_grep", "hypa_find", "hypa_ls"];
  const filtered = applyReplaceModeFilter(tools, "replace");
  assert.deepEqual(filtered, ["hypa_shell", "hypa_read", "hypa_grep", "hypa_find", "hypa_ls"]);
});

test("replace mode can preserve hashline read while disabling other Pi builtins", () => {
  const tools = ["bash", "read", "grep", "find", "ls", "replace", "undo_last_replace", "hypa_shell", "hypa_read", "hypa_grep", "hypa_find", "hypa_ls"];
  const disabledBuiltins = new Set(["bash", "grep", "find", "ls"]);
  const filtered = applyReplaceModeFilter(tools, "replace", disabledBuiltins);
  assert.deepEqual(filtered, ["read", "replace", "undo_last_replace", "hypa_shell", "hypa_read", "hypa_grep", "hypa_find", "hypa_ls"]);
});

test("replace mode with an empty disabled list leaves active tools unchanged", () => {
  const tools = ["bash", "read", "grep", "find", "ls", "hypa_shell", "hypa_read"];
  assert.deepEqual(applyReplaceModeFilter(tools, "replace", new Set()), tools);
});

test("replace mode filter is a no-op when configured builtins are absent", () => {
  const tools = ["read", "hypa_shell", "hypa_read", "hypa_grep"];
  const disabledBuiltins = new Set(["bash", "grep", "find", "ls"]);
  assert.deepEqual(applyReplaceModeFilter(tools, "replace", disabledBuiltins), tools);
});

test("replace mode filter is idempotent", () => {
  const tools = ["bash", "read", "hypa_shell", "hypa_read"];
  const disabledBuiltins = new Set(["bash", "grep", "find", "ls"]);
  const once = applyReplaceModeFilter(tools, "replace", disabledBuiltins);
  const twice = applyReplaceModeFilter(once, "replace", disabledBuiltins);
  assert.deepEqual(once, twice);
});

test("replace mode filter re-runs on subsequent turns and preserves read", () => {
  const toolsWithBuiltins = ["bash", "read", "grep", "find", "ls", "hypa_shell", "hypa_read"];
  const disabledBuiltins = new Set(["bash", "grep", "find", "ls"]);
  let activeTools = [...toolsWithBuiltins];

  function simulateBeforeAgentStart() {
    activeTools = applyReplaceModeFilter(activeTools, "replace", disabledBuiltins);
  }

  simulateBeforeAgentStart();
  assert.deepEqual(activeTools, ["read", "hypa_shell", "hypa_read"]);

  // Simulate Pi re-registering builtins (e.g. after /reload).
  activeTools = [...toolsWithBuiltins];
  simulateBeforeAgentStart();
  assert.deepEqual(activeTools, ["read", "hypa_shell", "hypa_read"]);
});

test("additive mode does not apply a configured replace filter", () => {
  const tools = ["bash", "read", "grep", "find", "ls", "hypa_shell"];
  const disabledBuiltins = new Set(["bash", "grep", "find", "ls"]);
  assert.deepEqual(applyReplaceModeFilter(tools, "additive", disabledBuiltins), tools);
});
