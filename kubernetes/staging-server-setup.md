# Staging Server Setup Guide

## Option A: Local Docker-based Staging Server (Recommended for Testing)

### Prerequisites
- Docker Desktop installed and running
- WSL2 enabled (for Windows)

### Setup Steps

1. **Create a staging server container:**
```bash
# Create a Ubuntu container that acts as your staging server
docker run -d \
  --name staging-server \
  -p 2222:22 \
  -p 8080:8080 \
  -e SSH_ENABLE_ROOT=true \
  ubuntu:22.04 \
  /bin/bash -c "
    apt-get update && \
    apt-get install -y openssh-server sudo curl wget git && \
    mkdir -p /var/run/sshd && \
    useradd -m -s /bin/bash ubuntu && \
    echo 'ubuntu:password123' | chpasswd && \
    echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
    mkdir -p /home/ubuntu/.ssh && \
    chmod 700 /home/ubuntu/.ssh && \
    chown ubuntu:ubuntu /home/ubuntu/.ssh && \
    service ssh start && \
    tail -f /dev/null
  "
```

2. **Copy your SSH public key to the container:**
```bash
# Copy your public key to the staging server
docker exec staging-server bash -c "echo '$(cat ~/.ssh/id_rsa.pub)' >> /home/ubuntu/.ssh/authorized_keys"
docker exec staging-server bash -c "chmod 600 /home/ubuntu/.ssh/authorized_keys"
docker exec staging-server bash -c "chown ubuntu:ubuntu /home/ubuntu/.ssh/authorized_keys"
```

3. **Test SSH connection:**
```bash
ssh -p 2222 ubuntu@localhost
```

**Your staging server details:**
- **STAGING_HOST**: `192.168.0.187` (current working IP - recommended for now)
- **STAGING_USER**: `ubuntu`
- **STAGING_SSH_KEY**: Use the SSH key we already have

**Alternative hosts for testing:**
- `staging.hauntkit.shop` (domain - use once DNS propagates fully)
- `localhost` (local only access)

## Option B: Cloud-based Staging Server (Production-ready)

### AWS EC2 Free Tier
1. Go to AWS Console → EC2
2. Launch Instance → Ubuntu 22.04 LTS
3. Choose t2.micro (free tier eligible)
4. Create/use existing key pair
5. Configure security group (allow SSH port 22)
6. Launch instance
7. Note the public IP address

### DigitalOcean Droplet ($6/month)
1. Go to DigitalOcean Console
2. Create Droplet → Ubuntu 22.04
3. Choose $6/month basic plan
4. Add SSH key
5. Create droplet
6. Note the IP address

### Azure VM (Free trial available)
1. Go to Azure Portal
2. Create Virtual Machine → Ubuntu 22.04
3. Choose B1s size (free tier eligible)
4. Configure SSH authentication
5. Create VM
6. Note the public IP address

## Option C: Local VM using Hyper-V/VirtualBox

### Using Hyper-V (Windows Pro/Enterprise)
1. Enable Hyper-V in Windows Features
2. Download Ubuntu 22.04 ISO
3. Create new VM with 2GB RAM, 20GB disk
4. Install Ubuntu
5. Configure SSH server
6. Set up port forwarding or bridged networking
7. Note the VM's IP address

### Using VirtualBox (Free)
1. Download and install VirtualBox
2. Download Ubuntu 22.04 ISO
3. Create new VM with 2GB RAM, 20GB disk
4. Install Ubuntu
5. Configure SSH server
6. Set up port forwarding (Host: 2222 → Guest: 22)
7. Use `localhost:2222` as your staging host

## Recommended: Start with Option A (Docker)

This is the quickest way to get a staging server running for testing your deployment pipeline.
