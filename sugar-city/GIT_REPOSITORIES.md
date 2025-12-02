# 🔄 Git Repository Structure

## ⚠️ IMPORTANT: ONE Git Repository, TWO Vercel Projects

Sugar City Express uses **ONE Git repository** with **TWO separate Vercel projects**:

### **Single Git Repository**
- **Location**: Root directory (`/Users/baptistefam/sugar-city`)
- **Git Remote**: Check with `git remote -v` in root directory
- **Contains**: Both booking website AND admin portal code

### **Two Vercel Projects**

1. **`booking`** - Main booking website
   - Deploys from: Root directory (`/`)
   - Vercel watches the same git repo
   - Auto-deploys when changes are pushed to root files

2. **`admin-portal`** - Admin dashboard
   - Deploys from: `/admin-portal` subdirectory
   - Vercel watches the same git repo
   - Auto-deploys when changes are pushed to admin-portal files

### **How It Works**

- **All changes go to ONE git repository** (root directory)
- Vercel automatically detects which files changed
- If root files change → `booking` project deploys
- If admin-portal files change → `admin-portal` project deploys
- If both change → both projects deploy

**Commands (always from root):**
```bash
cd /Users/baptistefam/sugar-city
git add .
git commit -m "Your message"
git push origin main
```

**Vercel automatically handles the rest!**

## 🚨 Important Notes

1. **✅ DO**: Always commit from the root directory
2. **✅ DO**: Include all changes (booking + admin portal) in the same commit
3. **✅ DO**: Push once - Vercel handles both deployments automatically
4. **❌ DON'T**: Try to push from admin-portal directory (it's not a separate repo)
5. **❌ DON'T**: Set up separate git remotes for admin-portal

## 🔍 How to Verify

### Check Git Repository:
```bash
cd /Users/baptistefam/sugar-city
git remote -v
# Should show your single git repository
```

### Check Vercel Projects:
```bash
# Check which Vercel project is linked in root
cat .vercel/project.json

# Check which Vercel project is linked in admin-portal
cat admin-portal/.vercel/project.json
```

## 📝 Workflow Examples

### Example 1: Fixing Products Save Issue (Admin Portal)
```bash
# 1. Navigate to root directory (always!)
cd /Users/baptistefam/sugar-city

# 2. Make changes to admin portal files
# ... edit admin-portal/src/app/pos/products/page.tsx ...

# 3. Commit and push (from root)
git add admin-portal/src/app/pos/products/page.tsx
git commit -m "Fix products save: Use API routes"
git push origin main

# 4. Vercel automatically deploys admin-portal project
```

### Example 2: Updating Booking Page Images (Booking Site)
```bash
# 1. Navigate to root directory
cd /Users/baptistefam/sugar-city

# 2. Make changes to booking site
# ... edit src/app/book/BookingPageClient.tsx public/booking-hero.png ...

# 3. Commit and push (from root)
git add src/app/book/BookingPageClient.tsx public/booking-hero.png
git commit -m "Update booking page images"
git push origin main

# 4. Vercel automatically deploys booking project
```

### Example 3: Updating Firestore Rules
```bash
# 1. Navigate to root directory (rules are in root)
cd /Users/baptistefam/sugar-city

# 2. Update rules
# ... edit firestore.rules ...

# 3. Commit and push (from root)
git add firestore.rules
git commit -m "Add read access for admin collections"
git push origin main

# 4. Deploy rules separately (not via Vercel)
firebase deploy --only firestore:rules
```

### Example 4: Making Changes to Both Projects
```bash
# 1. Navigate to root directory
cd /Users/baptistefam/sugar-city

# 2. Make changes to both booking and admin portal
# ... edit files in both ...

# 3. Commit everything together (from root)
git add .
git commit -m "Update booking page and fix admin portal products"
git push origin main

# 4. Vercel automatically deploys BOTH projects
```

## 🎯 Quick Reference

| What Changed | Vercel Project | Git Command (always from root) |
|-------------|----------------|-------------------------------|
| Booking page files | `booking` | `cd /Users/baptistefam/sugar-city && git add src/... && git commit && git push` |
| Admin portal files | `admin-portal` | `cd /Users/baptistefam/sugar-city && git add admin-portal/... && git commit && git push` |
| Firestore rules | Both (shared) | `cd /Users/baptistefam/sugar-city && git add firestore.rules && git commit && git push` |
| Root config files | `booking` | `cd /Users/baptistefam/sugar-city && git add package.json && git commit && git push` |
| Admin config files | `admin-portal` | `cd /Users/baptistefam/sugar-city && git add admin-portal/package.json && git commit && git push` |

## ✅ Before Every Push

1. **Always be in root directory**: `cd /Users/baptistefam/sugar-city`
2. **Check git remote**: `git remote -v` (should show ONE repository)
3. **Check what files changed**: `git status`
4. **Push once**: `git push origin main`
5. **Vercel handles both deployments automatically**

