# 🚀 LocalAI Launch System

## Overview
This launch system provides production-ready scripts to start your LocalAI daemon with automatic model loading, environment configuration, and debug features.

## 📁 Files Created

### Core Scripts
- **`launch.sh`** - Bash script for Linux/macOS/WSL
- **`launch.ps1`** - PowerShell script for Windows  
- **`launch.bat`** - Batch wrapper for Windows (runs PowerShell script)

### Generated Files
- **`config/config.yaml`** - Main LocalAI configuration
- **`config/phi2.yaml`** - Phi-2 model configuration  
- **`config/models.yaml`** - Multi-model configuration
- **`debug.sh`** / **`debug.ps1`** - Debug helper scripts
- **`logs/localai.log`** - Application logs
- **`models/`** - Model storage directory

## 🚀 Usage

### Windows
```powershell
# Quick launch (recommended)
.\launch.bat

# Direct PowerShell  
.\launch.ps1

# With options
.\launch.ps1 -Debug -InjectArtifacts
```

### Linux/macOS/WSL
```bash
# Basic launch
./launch.sh

# With options
./launch.sh --debug --inject-artifacts
```

## 🎛️ Command Line Options

| Option | Description |
|--------|-------------|
| `--debug` / `-Debug` | Enable debug mode with verbose logging |
| `--inject-artifacts` / `-InjectArtifacts` | Enable artifact injection features |
| `--no-preload` / `-NoPreload` | Disable automatic model preloading |
| `--help` / `-Help` | Show help message |

## 🔧 Environment Variables

The launch scripts automatically set these environment variables:

```bash
CGO_ENABLED=0              # Disable CGO for pure Go builds
GOOS=linux|windows         # Target OS
GOARCH=amd64              # Target architecture  
LOCALAI_DEBUG=true        # Enable debug mode
LOCALAI_LOG_LEVEL=debug   # Set log level
LOCALAI_CONFIG_FILE       # Config file path
LOCALAI_MODELS_PATH       # Models directory
LOCALAI_LOG_FILE          # Log file path
```

## 📦 Model Management

### Automatic Setup
The launch scripts automatically:
- Create model configuration files
- Set up directory structure
- Download placeholder models (you need to replace with actual models)

### Phi-2 Model Configuration
```yaml
name: phi-2
backend: llama
parameters:
  model: phi-2
  context_size: 2048
  threads: 4
  f16: true
```

### Adding Real Models
1. Place your `.gguf` model files in the `models/` directory
2. Update the configuration files in `config/`
3. Restart LocalAI

## 🎯 Server Configuration

### Default Settings
- **Address**: `0.0.0.0` (all interfaces)
- **Port**: `8080`
- **Context Size**: `2048`
- **Threads**: `8`
- **CORS**: Enabled
- **Debug**: Enabled

### Accessing LocalAI
- **API Endpoint**: `http://localhost:8080`
- **Health Check**: `http://localhost:8080/health`
- **OpenAPI Docs**: `http://localhost:8080/docs`

## 🐛 Debug Features

### Debug Script
Run the debug helper to get system information:
```bash
# Linux/macOS
./debug.sh

# Windows
.\debug.ps1
```

### Debug Output
- Current configuration
- Environment variables
- Recent log entries
- System status

### Log Files
- **Location**: `logs/localai.log`
- **Format**: Timestamped entries with log levels
- **Rotation**: Automatic (handled by LocalAI)

## 🔍 Troubleshooting

### Common Issues

#### Binary Not Found
```
ERROR: LocalAI binary not found at: ./bazel-bin/local-ai_/local-ai.exe
```
**Solution**: Run `bazel build //:local-ai` first

#### Permission Denied (Linux/macOS)
```bash
chmod +x launch.sh
./launch.sh
```

#### PowerShell Execution Policy (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Port Already in Use
- Change port in `config/config.yaml`
- Or kill existing process: `pkill local-ai`

### Health Check
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status": "ok"}
```

## 🎯 Advanced Configuration

### Custom Model Loading
Edit `config/config.yaml`:
```yaml
preload_models:
  - id: my-model
    name: my-custom-model
    config: "./config/my-model.yaml"
```

### Performance Tuning
```yaml
threads: 16              # Increase for more CPU cores
context_size: 4096       # Increase for longer conversations
parallel_requests: true  # Enable concurrent requests
```

### Security Settings
```yaml
cors: false             # Disable CORS for production
upload_limit: 100       # Limit file uploads (MB)
api_keys:              # Add API key authentication
  - "your-api-key-here"
```

## 🚀 Production Deployment

### Systemd Service (Linux)
Create `/etc/systemd/system/localai.service`:
```ini
[Unit]
Description=LocalAI Service
After=network.target

[Service]
Type=simple
User=localai
WorkingDirectory=/opt/localai
ExecStart=/opt/localai/launch.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Windows Service
Use `nssm` (Non-Sucking Service Manager):
```cmd
nssm install LocalAI "C:\LocalAI\launch.bat"
nssm set LocalAI AppDirectory "C:\LocalAI"
nssm start LocalAI
```

## 📚 Next Steps

1. **Replace placeholder models** with actual model files
2. **Customize configuration** for your use case
3. **Set up monitoring** and logging
4. **Configure authentication** for production
5. **Add SSL/TLS** for secure connections

## 🎉 Success Indicators

✅ **Server starts without errors**
✅ **Health check returns 200 OK**
✅ **Models load successfully**
✅ **API endpoints respond**
✅ **Debug information is accessible**

The LocalAI launch system is now ready for production use! 🚀
