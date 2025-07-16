@echo off
echo 🔮 Lore Engine GitHub Secrets Configuration
echo ==========================================
echo.
echo This script will help you configure GitHub secrets for deployment.
echo.
echo Prerequisites:
echo - GitHub CLI installed (gh.exe)
echo - GitHub repository created
echo - GitHub Personal Access Token with repo permissions
echo.
echo Press any key to continue...
pause > nul
echo.

powershell.exe -ExecutionPolicy Bypass -File "configure-github-secrets.ps1" -Interactive

echo.
echo 🎉 Configuration complete!
echo.
echo Next steps:
echo 1. Review the generated commands above
echo 2. Run the 'gh secret set' commands to configure your secrets
echo 3. Set up your servers with the provided SSH keys
echo 4. Test the deployment pipeline
echo.
pause
