#!/bin/bash
# update-from-github.sh
# হেটজনার সার্ভারে /var/www/kongossa-pay ডিরেক্টরিতে এই স্ক্রিপ্ট রাখুন

set -e  # কোনো কমান্ড fail হলে স্ক্রিপ্ট থামবে

echo "=========================================="
echo "  Updating Kongossa-Pay from GitHub"
echo "=========================================="

# 1. প্রোজেক্ট ডিরেক্টরিতে যান
cd /var/www/kongossa-pay

# 2. বর্তমান ব্রাঞ্চ চেক
BRANCH=$(git branch --show-current)
echo "Current branch: $BRANCH"

# 3. লোকাল পরিবর্তন stash করুন (যদি থাকে)
echo "Stashing local changes if any..."
git stash --include-untracked || true

# 4. GitHub থেকে পুল করুন
echo "Pulling latest code from GitHub..."
git pull origin $BRANCH

# 5. Stash pop (যদি দরকার হয়)
echo "Applying stashed changes..."
git stash pop || true

# 6. ফ্রন্টেন্ড রিবিল্ড
echo "Rebuilding frontend container..."
docker compose down frontend
docker compose build frontend --no-cache
docker compose up -d frontend

# 7. ব্যাকএন্ড রিবিল্ড (যদি দরকার হয়, নিচে uncomment করুন)
# echo "Rebuilding backend container..."
# docker compose down backend
# docker compose build backend --no-cache
# docker compose up -d backend

# 8. কন্টেইনার লগ চেক (শেষ ১০ লাইন)
echo "Frontend logs (last 10 lines):"
docker compose logs frontend --tail 10

# 9. রানিং কন্টেইনার দেখান
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 10. পারমিশন ঠিক করুন (যদি দরকার হয়)
chmod -R 755 /var/www/kongossa-pay/kongossa-backend/uploads 2>/dev/null || true

echo "=========================================="
echo "  Update completed successfully!"
echo "=========================================="