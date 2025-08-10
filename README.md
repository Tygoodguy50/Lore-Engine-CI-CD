# LocalAI - Bazel + Bzlmod Build Configuration

![Backend Health](https://github.com/Tygoodguy50/Lore-Engine-CI-CD/actions/workflows/health-check.yml/badge.svg)


This repository demonstrates how to build LocalAI using Bazel with the modern Bzlmod module system, resolving the common `github.com/pkg/errors` indirect dependency issue.

## 🔧 Problem Solved: pkg/errors Indirect Dependency

### The Issue

When migrating from WORKSPACE to MODULE.bazel, Gazelle often fails to resolve `@com_github_pkg_errors` because:

- It's marked as `indirect` in `go.mod`
- Bazel's go_deps extension doesn't automatically include all indirect dependencies
- No `go_deps.override(...)` is supported in Bzlmod

### The Solution

Our `MODULE.bazel` implements a **dual approach**:

1. **Explicit Module Declaration**: Force include the dependency

```python
go_deps.module(
    path = "github.com/pkg/errors",
    sum = "h1:FEBLx1zS214owpjy7qsBeixbURkuhQAwrK5UwLGTwt4=",
    version = "v0.9.1",
)
```

1. **Force Repository Inclusion**: Explicitly list in `use_repo(...)`

```python
use_repo(
    go_deps,
    "com_github_pkg_errors",  # 🎯 KEY FIX!
    # ... other dependencies
)
```

## 🚀 Quick Start

### Prerequisites

- Bazel 7.0+ (with Bzlmod support)
- Go 1.21+
- Windows PowerShell (for scripts)

### Build Steps

1. **Clone and Setup**

```bash
git clone <your-repo>
cd LocalAI
```

1. **Update Dependencies**

```bash
go mod tidy
```

1. **Generate Bazel Files**

```bash
bazel run //:gazelle-update-repos
bazel run //:gazelle
```

1. **Build the Project**

```bash
bazel build //cmd/local-ai:local-ai
```

1. **Run Tests**

```bash
bazel test //...
```text

### 🪟 Windows PowerShell Scripts

Use the provided PowerShell scripts for easier building:

```powershell
# Full build process
.\scripts\build.ps1

# Debug pkg/errors issues
.\scripts\debug-pkg-errors.ps1
```

## 📁 Project Structure

```
LocalAI/
├── MODULE.bazel             # 🔧 Bzlmod configuration (solves pkg/errors issue)
├── BUILD.bazel              # Root build file with Gazelle rules
├── go.mod                   # Go module with indirect dependencies
├── .bazelignore             # Excludes non-Go directories
├── cmd/
│   └── local-ai/
│       ├── main.go          # Main application entry point
│       └── BUILD.bazel      # Binary target
├── pkg/
│   └── oci/
│       ├── container.go     # 🎯 Uses pkg/errors (demonstrates fix)
│       └── BUILD.bazel      # Library target
└── scripts/
    ├── build.ps1            # Windows build script
    └── debug-pkg-errors.ps1 # Debug script for dependency issues
```

## 🔍 Key Configuration Files

### MODULE.bazel

- Uses `rules_go` and `gazelle` for Go support
- Implements dual fix for `pkg/errors` indirect dependency
- Includes common dependencies that might be indirect

### BUILD.bazel Files

- Root: Gazelle configuration and main binary
- cmd/local-ai: Application binary target  
- pkg/oci: Library demonstrating pkg/errors usage

## 🐛 Troubleshooting

### Common Issues

1. **"@com_github_pkg_errors not found"**
   - Ensure `com_github_pkg_errors` is in `use_repo(...)` in MODULE.bazel
   - Run `bazel run //:gazelle-update-repos` to regenerate

2. **"indirect dependency not resolved"**
   - Add explicit `go_deps.module(...)` declaration
   - Consider making the dependency direct: `go get github.com/pkg/errors`

3. **"BUILD file not found"**
   - Run `bazel run //:gazelle` to generate BUILD files
   - Check `.bazelignore` for excluded directories

### Debug Commands

```bash
# Check if pkg/errors repository exists
bazel query @com_github_pkg_errors//...

# List all external repositories  
bazel query 'kind(.*_repository, @...)'

# Show dependencies of a target
bazel query 'deps(//pkg/oci:oci)'

# Build with verbose output
bazel build //pkg/oci:oci --verbose_failures
```

## 🎯 Migration from WORKSPACE

If migrating from WORKSPACE-based Bazel:

1. **Remove/rename WORKSPACE** → `WORKSPACE.bazel` (legacy)
2. **Create MODULE.bazel** with go_deps extension
3. **Update BUILD files** to use new repository names
4. **Handle indirect dependencies** using this project's approach

## 📝 Key Learnings

- **Bzlmod requires explicit use_repo declarations** for external dependencies
- **Indirect dependencies need special handling** in MODULE.bazel
- **go_deps.module() can force include specific versions**
- **Gazelle integration works seamlessly** with proper configuration

## 🔗 References

- [Bazel Bzlmod Documentation](https://bazel.build/external/bzlmod)
- [rules_go with Bzlmod](https://github.com/bazelbuild/rules_go/blob/master/docs/go/core/bzlmod.md)
- [Gazelle Documentation](https://github.com/bazelbuild/bazel-gazelle)

---

This configuration successfully resolves the `pkg/errors` indirect dependency issue while providing a modern, maintainable Bazel build system for LocalAI.

## 🧪 Local Deployment & Health Tasks

The repo includes VS Code tasks (see `.vscode/tasks.json`) to streamline local backend deployment and validation:

- Deploy Haunted Empire Backend: Runs `deploy-backend.ps1` which invokes `launch.ps1 -SkipBash` and waits for a healthy backend on port 3300.
- Post-Deployment Health Check: Polls port 3300 first, then 8081 (if LocalAI sidecar is enabled) and reports the first healthy endpoint.

### Quick Commands


```powershell
# Deploy backend only
pwsh ./deploy-backend.ps1

# Tail deployment log
Get-Content .\DEPLOYMENT_LOG.txt -Tail 40 -Wait

# Manual health probe
Invoke-WebRequest http://localhost:3300/health | Select-Object -ExpandProperty Content
```

 
### Why two ports?

Port 3300 hosts the Node backend. Port 8081 is reserved for the optional LocalAI / dispatcher stack. Health tasks probe 3300 first to avoid false negatives when 8081 services are intentionally skipped.

 
### Customizing Timeout / Ports

`deploy-backend.ps1` accepts `-Ports` and `-TimeoutSeconds` parameters:

```powershell
pwsh ./deploy-backend.ps1 -Ports 3300,8081 -TimeoutSeconds 90
```

You can also override default port probing via environment variables (no need to pass `-Ports`):

Priority order when `-Ports` is omitted:

1. `HEALTH_PORTS` (comma / space / semicolon separated list, e.g. `HEALTH_PORTS=3301,8090`)
2. `BACKEND_PORT` plus optional `LOCALAI_PORT` (combined, duplicates removed)
3. Built-in default `3300,8081`

Examples:

```powershell
$env:BACKEND_PORT=4400; pwsh ./deploy-backend.ps1
$env:BACKEND_PORT=4400; $env:LOCALAI_PORT=9001; pwsh ./scripts/health-check.ps1
$env:HEALTH_PORTS='5500 9100'; pwsh ./launch.ps1
```

Explicit `-Ports` always overrides env-based values.

 
### Adding New Automation Tasks

To add a new task without whitelisting additional editor files, keep using the existing `.vscode/tasks.json` (already whitelisted in `.gitignore`).

---
