# 🚀 Vercel Deployment Structure

## ⚠️ IMPORTANT: Deploy Directly to Vercel, NOT via Git Push

Sugar City Express uses **TWO separate Vercel projects** that are deployed directly via Vercel CLI:

### **Two Vercel Projects**

1. **`booking`** - Main booking website
   - Deploys from: Root directory (`/Users/baptistefam/sugar-city`)
   - Deploy command: `cd /Users/baptistefam/sugar-city && vercel --prod`
   - Contains: Main booking website code

2. **`admin-portal`** - Admin dashboard
   - Deploys from: `/admin-portal` subdirectory
   - Deploy command: `cd /Users/baptistefam/sugar-city/admin-portal && vercel --prod`
   - Contains: Admin portal code

### **How It Works**

- **NO git push for deployments** - Deploy directly to Vercel
- Each project must be deployed separately
- Make sure you're linked to the correct Vercel project before deploying
- Use `vercel --prod` to deploy to production

**Deployment Commands:**

**For Booking Site:**
```bash
cd /Users/baptistefam/sugar-city
vercel --prod
```

**For Admin Portal:**
```bash
cd /Users/baptistefam/sugar-city/admin-portal
vercel --prod
```

## 🚨 Important Notes

1. **✅ DO**: Deploy directly to Vercel using `vercel --prod`
2. **✅ DO**: Deploy booking site from root directory
3. **✅ DO**: Deploy admin portal from admin-portal directory
4. **✅ DO**: Verify which Vercel project you're linked to before deploying
5. **❌ DON'T**: Use git push to trigger deployments
6. **❌ DON'T**: Deploy from wrong directory

## 🔍 How to Verify Vercel Project

### Check Booking Project:
```bash
cd /Users/baptistefam/sugar-city
cat .vercel/project.json
# Should show "booking" project
```

### Check Admin Portal Project:
```bash
cd /Users/baptistefam/sugar-city/admin-portal
cat .vercel/project.json
# Should show "admin-portal" project
```

### Link to Correct Project (if needed):
```bash
# For booking site
cd /Users/baptistefam/sugar-city
vercel link
# Select "booking" project

# For admin portal
cd /Users/baptistefam/sugar-city/admin-portal
vercel link
# Select "admin-portal" project
```

## 📝 Workflow Examples

### Example 1: Fixing Products Save Issue (Admin Portal)
```bash
# 1. Make changes to admin portal files
# ... edit admin-portal/src/app/pos/products/page.tsx ...

# 2. Navigate to admin-portal directory
cd /Users/baptistefam/sugar-city/admin-portal

# 3. Verify linked to admin-portal project
cat .vercel/project.json

# 4. Deploy to Vercel
vercel --prod
```

### Example 2: Updating Booking Page Images (Booking Site)
```bash
# 1. Make changes to booking site
# ... edit src/app/book/BookingPageClient.tsx public/booking-hero.png ...

# 2. Navigate to root directory
cd /Users/baptistefam/sugar-city

# 3. Verify linked to booking project
cat .vercel/project.json

# 4. Deploy to Vercel
vercel --prod
```

### Example 3: Updating Firestore Rules
```bash
# 1. Update rules (in root directory)
# ... edit firestore.rules ...

# 2. Deploy rules to Firebase (not Vercel)
cd /Users/baptistefam/sugar-city
firebase deploy --only firestore:rules
```

### Example 4: Making Changes to Both Projects
```bash
# 1. Make changes to both booking and admin portal
# ... edit files in both ...

# 2. Deploy booking site first
cd /Users/baptistefam/sugar-city
vercel --prod

# 3. Deploy admin portal second
cd /Users/baptistefam/sugar-city/admin-portal
vercel --prod
```

## 🎯 Quick Reference

| What Changed | Vercel Project | Deploy Command |
|-------------|----------------|----------------|
| Booking page files | `booking` | `cd /Users/baptistefam/sugar-city && vercel --prod` |
| Admin portal files | `admin-portal` | `cd /Users/baptistefam/sugar-city/admin-portal && vercel --prod` |
| Firestore rules | Firebase (not Vercel) | `cd /Users/baptistefam/sugar-city && firebase deploy --only firestore:rules` |
| Root config files | `booking` | `cd /Users/baptistefam/sugar-city && vercel --prod` |
| Admin config files | `admin-portal` | `cd /Users/baptistefam/sugar-city/admin-portal && vercel --prod` |

## ✅ Before Every Deployment

1. **Check which directory you're in**: `pwd`
2. **Verify Vercel project**: `cat .vercel/project.json`
3. **Make sure you're linked to correct project**: Should match what you're deploying
4. **Deploy**: `vercel --prod`
5. **Deploy each project separately** if both changed


