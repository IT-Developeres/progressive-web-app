# PWA Testing Guide

## 🧪 Complete Testing Checklist

### Phase 1: Online Mode Testing

#### 1.1 Basic Functionality
- [ ] Load app in browser
- [ ] See all products displayed
- [ ] Filter products by category
- [ ] Add items to cart
- [ ] View cart sidebar
- [ ] Checkout button visible
- [ ] Navigation links work

#### 1.2 Installation Prompts
- [ ] Install button appears in header
- [ ] Install banner appears at bottom
- [ ] Dismiss banner hides it
- [ ] Click install shows system prompt
- [ ] Accept install adds to home screen

#### 1.3 Service Worker Registration
- [ ] Open DevTools (F12)
- [ ] Go to Application tab
- [ ] Check Service Workers section
- [ ] Should show "sw.js" as active
- [ ] Status shows "activated and running"

#### 1.4 Caching
- [ ] Open Application → Cache Storage
- [ ] Should see multiple cache entries:
  - `techstore-v1` (main assets)
  - `techstore-images-*` (images)
  - `techstore-data-*` (data)
- [ ] Each cache contains expected files

---

### Phase 2: Offline Testing

#### 2.1 Test Offline Mode
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Reload page (Ctrl+R)

- [ ] App loads without errors
- [ ] Products display from cache
- [ ] Filtering still works
- [ ] Can still add to cart
- [ ] Cart sidebar works
- [ ] All styling intact
- [ ] Images load (from cache)

#### 2.2 Offline Indicators
- [ ] See "📡 Offline Mode" badge
- [ ] Notification shows "You are offline"
- [ ] Background subtly changes
- [ ] No console errors

#### 2.3 Return to Online
1. Uncheck "Offline" in Network tab
2. Refresh page

- [ ] See "✅ You are online" notification
- [ ] Offline badge disappears
- [ ] Background returns to normal
- [ ] App works normally

---

### Phase 3: Mobile Testing

#### 3.1 Responsive Layout
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select different devices

- [ ] iPhone SE (375px):
  - [ ] Header fits properly
  - [ ] Menu is readable
  - [ ] Products in 1 column
  - [ ] Buttons are touch-friendly

- [ ] iPad (768px):
  - [ ] Products in 2-3 columns
  - [ ] Cart sidebar works
  - [ ] Layout is balanced

- [ ] Desktop (1920px):
  - [ ] Products in 4+ columns
  - [ ] All elements properly spaced

#### 3.2 Touch Interactions
- [ ] Tap products to view
- [ ] Swipe cart sidebar
- [ ] Tap buttons easily (44x44px minimum)
- [ ] No zoom/pinch issues

#### 3.3 Install on Mobile
**Android Chrome:**
1. Open app on Chrome
2. Menu (three dots)
3. Tap "Install app"
4. Confirm install

- [ ] App added to home screen
- [ ] Icon displays correctly
- [ ] App opens in standalone mode
- [ ] Navigation bar hidden
- [ ] Status bar is themed

**iOS Safari:**
1. Open app in Safari
2. Share button
3. "Add to Home Screen"
4. Name appears as "TechStore"

- [ ] App added to home screen
- [ ] Icon displays correctly
- [ ] App opens fullscreen
- [ ] Can navigate back to browser

---

### Phase 4: Cache & Performance

#### 4.1 Cache Strategies
1. First load: Network active
2. Check cached responses:

- [ ] HTML/CSS/JS: Network first
  - [ ] First load from network
  - [ ] Updates checked on subsequent visits
  
- [ ] Images: Cache first
  - [ ] Load instantly from cache
  - [ ] Fallback to network if not cached
  
- [ ] Data: Stale while revalidate
  - [ ] Serve from cache immediately
  - [ ] Update in background

#### 4.2 Loading Performance
- [ ] First visit: ~2-3 seconds
- [ ] Cached visit: <500ms
- [ ] Offline: Instant
- [ ] Network tab shows cached responses

#### 4.3 Cache Clearing
1. DevTools → Application → Cache Storage
2. Delete each cache manually
3. Or reload and let SW create new caches

- [ ] Clear cache successfully
- [ ] New cache created on reload
- [ ] All assets re-downloaded

---

### Phase 5: Browser Features

#### 5.1 Manifest Validation
1. DevTools → Application → Manifest
2. Check for errors

- [ ] Name displays correctly
- [ ] Short name shows
- [ ] Icons listed with purposes
- [ ] Start URL correct
- [ ] Display is standalone
- [ ] Theme color applied
- [ ] Screenshots included
- [ ] Shortcuts configured

#### 5.2 Meta Tags
1. DevTools → Elements
2. View `<head>` section

- [ ] viewport meta tag present
- [ ] theme-color set
- [ ] apple-mobile-web-app-capable: yes
- [ ] manifest.json linked
- [ ] All required meta tags present

#### 5.3 Security
- [ ] Works on localhost (no HTTPS needed for testing)
- [ ] Service Worker requires secure context
- [ ] All external assets loaded securely
- [ ] No mixed content warnings

---

### Phase 6: Dark Mode Testing

#### 6.1 Test System Dark Mode
**Windows:**
1. Settings → Personalization
2. Colors → Dark mode
3. Refresh browser

**Mac:**
1. System Preferences → General
2. Appearance → Dark
3. Refresh browser

**Linux:**
1. Theme settings
2. Set to dark
3. Refresh browser

- [ ] App colors change to dark theme
- [ ] Text remains readable
- [ ] Contrast sufficient
- [ ] All elements styled correctly

---

### Phase 7: Network Conditions

#### 7.1 Slow Network
1. DevTools → Network
2. Throttle: "Slow 3G"
3. Reload page

- [ ] App still loads
- [ ] Shows loading states if applicable
- [ ] Cached content loads fast anyway

#### 7.2 High Latency
1. DevTools → Network
2. Set custom latency: 500ms
3. Test functionality

- [ ] App handles delays gracefully
- [ ] No timeout errors
- [ ] Cache provides fallback

#### 7.3 Intermittent Connection
1. Toggle offline/online repeatedly
2. Refresh during offline
3. Go back online

- [ ] Status updates correctly
- [ ] No console errors
- [ ] Graceful fallbacks work

---

### Phase 8: Browser Compatibility

Test on these browsers:

#### Chrome/Edge (Chromium)
- [ ] Service Worker registers
- [ ] Install prompt shows
- [ ] All features work
- [ ] Offline mode works

#### Firefox
- [ ] Service Worker registers
- [ ] Cache Storage works
- [ ] Offline mode works
- [ ] Responsive works

#### Safari (Mac)
- [ ] Loads correctly
- [ ] Responsive works
- [ ] (Limited PWA support)

#### Safari (iOS)
- [ ] Opens properly
- [ ] Can add to home screen
- [ ] Touch-friendly
- [ ] Works offline (limited)

---

### Phase 9: Accessibility

#### 9.1 Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter activates buttons
- [ ] Can navigate cart
- [ ] Focus indicators visible

#### 9.2 Screen Reader (NVDA/JAWS)
- [ ] All buttons labeled
- [ ] Navigation readable
- [ ] Images have alt text
- [ ] Forms properly labeled

#### 9.3 Color Contrast
- [ ] Text readable on backgrounds
- [ ] Links distinguishable
- [ ] Buttons have sufficient contrast
- [ ] Icons have color + shape differentiation

#### 9.4 Motion
- [ ] Animations respect prefers-reduced-motion
- [ ] Transitions disabled for motion-sensitive users
- [ ] No flashing/strobing content

---

### Phase 10: Installation & Removal

#### 10.1 Install & Use
- [ ] Install via prompt
- [ ] App opens from home screen/shelf
- [ ] Standalone mode (no browser UI)
- [ ] Back button works
- [ ] Status bar themed

#### 10.2 Uninstall
- [ ] Right-click app icon
- [ ] Select "Uninstall"
- [ ] App removed successfully
- [ ] App data cleared
- [ ] Can reinstall

---

## 📊 Test Results Template

```
Date: __________
Browser: __________
Device: __________
OS: __________

Phase 1 (Online): ☐ PASS ☐ FAIL
Phase 2 (Offline): ☐ PASS ☐ FAIL
Phase 3 (Mobile): ☐ PASS ☐ FAIL
Phase 4 (Cache): ☐ PASS ☐ FAIL
Phase 5 (Features): ☐ PASS ☐ FAIL
Phase 6 (Dark Mode): ☐ PASS ☐ FAIL
Phase 7 (Network): ☐ PASS ☐ FAIL
Phase 8 (Compatibility): ☐ PASS ☐ FAIL
Phase 9 (Accessibility): ☐ PASS ☐ FAIL
Phase 10 (Install/Remove): ☐ PASS ☐ FAIL

Issues Found:
- _______________
- _______________

Notes:
_______________________________
```

---

## 🎯 Quick Test (5 minutes)

1. Open app online → See products ✅
2. Add to cart → See count update ✅
3. Go offline (DevTools) → Still works ✅
4. See offline badge ✅
5. Go online → Badge disappears ✅
6. Click Install → System prompt appears ✅
7. Mobile view → Responsive layout ✅

**If all 7 pass = PWA working correctly!** 🎉

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Service Worker not registering | Check HTTPS/localhost, clear cache |
| Install button not showing | Use Chrome/Edge, or Android Chrome |
| Offline mode shows errors | Clear cache, hard refresh (Ctrl+Shift+R) |
| Images not loading offline | Ensure images were loaded online first |
| Cache too large | Use DevTools to delete old caches |
| Dark mode not working | Check system settings, refresh browser |

---

**Happy Testing!** 🧪
