Write-Output "Synchronisation du dossier backend vers gamepoint-backend..."

# Copie récursive du contenu du dossier backend vers ../gamepoint-backend
Copy-Item -Path .\backend\* -Destination ..\gamepoint-backend\ -Recurse -Force

Write-Output "Commit et push vers le repo backend distant..."

# Se déplacer dans gamepoint-backend
Set-Location -Path ..\gamepoint-backend

git add .
git commit -m "Synchronisation backend"
git push origin main

Write-Output "Deploiement termine"