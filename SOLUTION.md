# 🎯 SOLUTION: pkg/errors with Bazel + Bzlmod

## Problem Summary
You're migrating LocalAI from WORKSPACE to MODULE.bazel and encountering the persistent issue where `@com_github_pkg_errors` isn't recognized by Bazel, even though it's in your go.mod file as an indirect dependency.

## Root Cause
- **Indirect dependencies** in go.mod are not automatically included in Bazel's dependency graph
- **go_deps extension** from Gazelle doesn't generate repositories for all indirect dependencies
- **No override mechanism** exists in Bzlmod (unlike WORKSPACE)

## ✅ Complete Solution

### 1. MODULE.bazel Configuration
```python
module(name = "local-ai", version = "0.0.0")

bazel_dep(name = "rules_go", version = "0.46.0")
bazel_dep(name = "gazelle", version = "0.35.0")

go_deps = use_extension("@gazelle//:extensions.bzl", "go_deps")
go_deps.from_file(go_mod = "//:go.mod")

# 🔧 EXPLICIT MODULE DECLARATION (Method 1)
go_deps.module(
    path = "github.com/pkg/errors",
    sum = "h1:FEBLx1zS214owpjy7qsBeixbURkuhQAwrK5UwLGTwt4=",
    version = "v0.9.1",
)

# 🔧 FORCE REPOSITORY INCLUSION (Method 2)
use_repo(go_deps, "com_github_pkg_errors")
```

### 2. Alternative: Make Direct Dependency
```bash
go get github.com/pkg/errors
go mod tidy
```

### 3. Regenerate Dependencies
```bash
bazel run //:gazelle-update-repos
bazel run //:gazelle
```

## 🚀 Build Commands
```bash
# Full build process
bazel build //cmd/local-ai:local-ai

# Test the OCI package that uses pkg/errors
bazel build //pkg/oci:oci

# Run all tests
bazel test //...
```

## 🔍 Verification
```bash
# Check if repository exists
bazel query @com_github_pkg_errors//...

# List external repositories
bazel query 'kind(.*_repository, @...)'

# Show dependencies
bazel query 'deps(//pkg/oci:oci)'
```

## 📝 Key Files Created
- `MODULE.bazel` - Bzlmod configuration with pkg/errors fix
- `BUILD.bazel` - Root build file with Gazelle rules
- `cmd/local-ai/BUILD.bazel` - Main binary target
- `pkg/oci/BUILD.bazel` - Library using pkg/errors
- `scripts/build.ps1` - Windows build script
- `scripts/debug-pkg-errors.ps1` - Debug script

## 🎉 Result
This configuration resolves the `github.com/pkg/errors` indirect dependency issue and provides a complete, working Bazel + Bzlmod setup for LocalAI.

The key insight is that **indirect dependencies must be explicitly handled** in Bzlmod, either through `go_deps.module()` or by making them direct dependencies.
