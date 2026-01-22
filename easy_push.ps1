$commitMessage = Read-Host "Enter commit message"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update"
}

git add .
git commit -m "$commitMessage"
git push origin main

Write-Host "Erfolgreich gepusht! 🚀" -ForegroundColor Cyan
