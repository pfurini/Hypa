# Hypa + Pi

Hypa integrates with Pi through the `@hypabolic/pi-hypa` Pi package. Installing the Pi package also installs `@hypabolic/hypa` as a package dependency and creates a best-effort user-level `hypa` shim when no `hypa` command is already on `PATH`. The shim delegates to a later global/system `hypa` install if one appears earlier on `PATH`, and otherwise falls back to the bundled dependency.

## Install

After the package is published:

```bash
pi install npm:@hypabolic/pi-hypa
```

For local development from this repository:

```bash
pi -e ./packages/pi-hypa/extensions/index.ts
# or
pi install ./packages/pi-hypa
```

Hypa can also add the package to Pi settings:

```bash
hypa init --agent pi
```

## What the package does

- Intercepts Pi `bash` tool calls and asks Hypa for a rewrite via `hypa rewrite --json`.
- Mutates rewritten bash commands before execution.
- Provides `/hypa` diagnostics.
- Registers CLI-backed tools (replace mode takes over the Pi builtin when both are active):
  - `hypa_shell` ← `bash`
  - `hypa_read` ← `read`
  - `hypa_grep` ← `grep`
  - `hypa_find` ← `find`
  - `hypa_ls` ← `ls`

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `HYPA_BIN` | bundled `@hypabolic/hypa`, then `hypa` | Hypa executable or absolute path. |
| `HYPA_PI_MODE` | `additive` | `additive` keeps Pi built-ins; `replace` disables each configured Pi built-in only while its matching `hypa_*` tool is active (fail-open if the replacement is absent, e.g. subagent/`--tools` allowlists). |
| `HYPA_PI_REWRITE_TIMEOUT_MS` | `5000` | Rewrite CLI timeout in milliseconds. |
| `HYPA_PI_ASK_NON_INTERACTIVE` | `deny` | `Ask` fallback when `ctx.hasUI === false`: `deny` or `allow`. |

The JSON config defaults to `~/.hypa-pi/config.json`. Its optional JSON-only `disabledBuiltins` field controls which built-ins replace mode filters. Valid names are `bash`, `read`, `grep`, `find`, and `ls`; names must not repeat. Omitting the field keeps all five defaults, while `[]` disables none. Listing a built-in makes it eligible for removal, not unconditionally removed: it is dropped only when its matching `hypa_*` tool is also active in the session.

For use with `pi-hashline-edit-pro`, preserve its hash-anchored `read` and let Hypa replace the other supported built-ins:

```json
{
  "mode": "replace",
  "disabledBuiltins": ["bash", "grep", "find", "ls"]
}
```

`hypa_read` remains available under its explicit name. Run `/hypa` to inspect the effective disabled built-ins.

## Release path

This repository syncs `packages/pi-hypa` into `Hypabolic/Hypa` through `.github/workflows/sync-public.yml`.
Workflow files are intentionally not synced by that recurring job because GitHub requires tokens that modify `.github/workflows/**` to have the `workflow` scope.

The public repository publishes `@hypabolic/pi-hypa` from tags using a manually installed `.github/workflows/pi-package-release.yml` workflow and GitHub Actions trusted publishing.

Before the first public release, ensure npm trusted publishing is configured for `@hypabolic/pi-hypa`:

- Provider: GitHub Actions
- Owner: `Hypabolic`
- Repository: `Hypa`
- Workflow: `pi-package-release.yml`

If npm requires the package to exist before trusted publishing can be configured, bootstrap `@hypabolic/pi-hypa` once under a non-latest tag, then configure trusted publishing and let release tags publish the real version.
