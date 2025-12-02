# 🔄 Git Repository Structure

## ⚠️ IMPORTANT: Two Separate Git Repositories

Sugar City Express uses **TWO SEPARATE Git repositories** for the booking site and admin portal:

### 1. **Booking Website Repository**
- **Location**: Root directory (`/Users/baptistefam/sugar-city`)
- **Git Remote**: `https://github.com/0xMikey-ooze/morningminis.git`
- **Vercel Project**: `booking`
- **Contains**: Main booking website code

**When to push here:**
- Changes to root directory files
- Changes to `src/` directory (main app)
- Changes to `public/` directory
- Changes to `firestore.rules`
- Changes to root `package.json`, `next.config.mjs`, etc.

**Commands:**
```bash
cd /Users/baptistefam/sugar-city
git add .
git commit -m "Your message"
git push origin main
```

### 2. **Admin Portal Repository**
- **Location**: Admin portal directory (`/Users/baptistefam/sugar-city/admin-portal`)
- **Git Remote**: `https://github.com/0xMikey-ooze/pos-product-grid.git`
- **Vercel Project**: `admin-portal`
- **Contains**: Admin portal code only

**When to push here:**
- Changes to `admin-portal/src/` directory
- Changes to `admin-portal/package.json`
- Changes to `admin-portal/next.config.ts`
- Changes to `admin-portal/vercel.json`
- Any admin portal specific files

**Commands:**
```bash
cd /Users/baptistefam/sugar-city/admin-portal
git add .
git commit -m "Your message"
git push origin main
```

## 🚨 Common Mistakes to Avoid

1. **❌ DON'T**: Push admin portal changes from root directory
2. **❌ DON'T**: Push booking site changes from admin-portal directory
3. **❌ DON'T**: Mix commits between the two repositories
4. **✅ DO**: Always check which directory you're in before committing
5. **✅ DO**: Use separate commits for booking vs admin portal changes

## 🔍 How to Verify You're in the Right Repository

### Check Booking Repository:
```bash
cd /Users/baptistefam/sugar-city
git remote -v
# Should show: origin -> https://github.com/0xMikey-ooze/morningminis.git
```

### Check Admin Portal Repository:
```bash
cd /Users/baptistefam/sugar-city/admin-portal
git remote -v
# Should show: origin -> https://github.com/0xMikey-ooze/pos-product-grid.git
```

## 📝 Workflow Examples

### Example 1: Fixing Products Save Issue (Admin Portal)
```bash
# 1. Navigate to admin portal
cd /Users/baptistefam/sugar-city/admin-portal

# 2. Make changes to admin portal files
# ... edit files ...

# 3. Commit and push to admin portal repo
git add src/app/pos/products/page.tsx
git commit -m "Fix products save: Use API routes"
git push origin main
```

### Example 2: Updating Booking Page Images (Booking Site)
```bash
# 1. Navigate to root directory
cd /Users/baptistefam/sugar-city

# 2. Make changes to booking site
# ... edit files ...

# 3. Commit and push to booking repo
git add src/app/book/BookingPageClient.tsx public/booking-hero.png
git commit -m "Update booking page images"
git push origin main
```

### Example 3: Updating Firestore Rules (Booking Site)
```bash
# 1. Navigate to root directory (rules are in root)
cd /Users/baptistefam/sugar-city

# 2. Update rules
# ... edit firestore.rules ...

# 3. Commit and push to booking repo
git add firestore.rules
git commit -m "Add read access for admin collections"
git push origin main

# 4. Deploy rules separately
firebase deploy --only firestore:rules
```

## 🎯 Quick Reference

| What Changed | Repository | Directory | Command |
|-------------|-----------|-----------|---------|
| Booking page | `morningminis` | `/` | `cd /Users/baptistefam/sugar-city && git push` |
| Admin portal | `pos-product-grid` | `/admin-portal` | `cd /Users/baptistefam/sugar-city/admin-portal && git push` |
| Firestore rules | `morningminis` | `/` | `cd /Users/baptistefam/sugar-city && git push` |
| Root config files | `morningminis` | `/` | `cd /Users/baptistefam/sugar-city && git push` |
| Admin config files | `pos-product-grid` | `/admin-portal` | `cd /Users/baptistefam/sugar-city/admin-portal && git push` |

## ✅ Before Every Push

1. **Check current directory**: `pwd`
2. **Check git remote**: `git remote -v`
3. **Check what files changed**: `git status`
4. **Verify you're pushing to the right repo**: Match the remote URL above

