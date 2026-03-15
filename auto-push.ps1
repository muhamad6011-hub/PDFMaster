while ($true) {

    git add .

    $changes = git status --porcelain

    if ($changes) {
        $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto update $time"
        git push
        Write-Host "Perubahan dipush ke GitHub pada $time"
    }

    Start-Sleep -Seconds 60
}