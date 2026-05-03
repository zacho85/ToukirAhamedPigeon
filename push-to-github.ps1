# push-to-github.ps1
# আপনার লোকাল প্রোজেক্ট ডিরেক্টরিতে এটি রান করুন

Write-Host "=== Pushing local changes to GitHub ===" -ForegroundColor Cyan

# 1. বর্তমান ব্রাঞ্চ দেখুন
$branch = git branch --show-current
Write-Host "Current branch: $branch" -ForegroundColor Yellow

# 2. সব পরিবর্তন দেখুন
Write-Host "`nChanges to be pushed:" -ForegroundColor Cyan
git status --short

# 3. কমিট মেসেজ নিন (অথবা ডিফল্ট ব্যবহার করুন)
$commitMessage = Read-Host "`nEnter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# 4. সব পরিবর্তন স্টেজ করুন
git add .

# 5. কমিট করুন
git commit -m "$commitMessage"

# 6. পুশ করুন
git push origin $branch

Write-Host "`n=== Push completed ===" -ForegroundColor Green