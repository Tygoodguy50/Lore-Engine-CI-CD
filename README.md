# LocalAI - Bazel + Bzlmod Build Configuration

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

2. **Force Repository Inclusion**: Explicitly list in `use_repo(...)`
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

2. **Update Dependencies**
```bash
go mod tidy
```

3. **Generate Bazel Files**
```bash
bazel run //:gazelle-update-repos
bazel run //:gazelle
```

4. **Build the Project**
```bash
bazel build //cmd/local-ai:local-ai
```

5. **Run Tests**
```bash
bazel test //...
```

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
