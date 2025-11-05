# Onboarding UX Manual Testing Guide

## Deployment Information
- **Production URL**: https://2b1ropt3xnh1.space.minimax.io
- **Test Date**: 2025-11-02
- **Build Status**: ✅ Successful (20.32s, 4.67MB bundle)
- **Browser Testing**: ❌ Unavailable (connection error)

---

## Critical Test Checklist

### TEST 1: Header Error Messages ✅ HIGH PRIORITY
**Objective**: Verify no error banners appear in header after login

**Steps**:
1. Navigate to https://2b1ropt3xnh1.space.minimax.io
2. Login or create a test account
3. After login, examine the header section carefully
4. Look for any red error banners or messages

**Expected Result**: ✅ PASS
- NO error messages about "Failed to load usage data"
- NO subscription error alerts
- NO red banners or error indicators
- Header shows clean UI with navigation only

**What Was Fixed**:
- `useSubscription.ts`: Added 10s timeout protection
- Errors now silently degrade to Free Plan default
- Error messages logged to console only (not shown to users)
- Removed subscription error banner from Dashboard header

**If FAIL**: Screenshot the error and check browser console (F12)

---

### TEST 2: Tooltip Tour Appearance ✅ HIGH PRIORITY
**Objective**: Verify small tooltip tour appears (not full-screen modal)

**Steps**:
1. After successful login, remain on the dashboard
2. Wait exactly 3-5 seconds without clicking anything
3. Observe what appears on screen

**Expected Result**: ✅ PASS
- Small tooltip box appears near a UI element
- Tooltip contains tour step information (title, description, step number)
- Tooltip has "Next", "Skip", and close buttons
- Background is NOT dimmed/blocked
- Dashboard remains fully visible and interactive

**What Was Implemented**:
- Created `TooltipTour.tsx` - non-blocking tooltip component
- Tour only shows for users with <50% onboarding completion
- 3-second delay before tour activation
- Small positioned tooltips (not full-screen modals)

**If FAIL**:
- Full-screen modal appears → Bug (old OnboardingModal still rendering)
- Nothing appears → Check localStorage: `onboarding_completion_percentage` should be <50
- Browser console for errors

---

### TEST 3: Navigation While Tour Active ✅ HIGH PRIORITY
**Objective**: Verify dashboard remains interactive during tour

**Steps**:
1. While tooltip tour is showing (before dismissing it)
2. Try clicking on different dashboard tabs:
   - Click "Analytics" tab
   - Click "Content" tab
   - Click "Research" tab
   - Click back to "Overview" tab
3. Observe if navigation works

**Expected Result**: ✅ PASS
- All tab clicks work normally
- Pages switch smoothly
- Tooltip remains visible (or moves with you)
- NO blocking overlays or disabled states
- Can interact with all dashboard elements

**What Was Implemented**:
- TooltipTour uses `position: fixed` with high z-index
- No overlay blocking clicks
- No `pointer-events: none` on background
- Tour component is separate from main UI

**If FAIL**: 
- Tabs don't respond → Bug (blocking overlay exists)
- Page freezes → Check browser console for errors

---

### TEST 4: Skip Tour Functionality ✅ HIGH PRIORITY
**Objective**: Verify "Skip" dismisses tour permanently

**Steps**:
1. While tooltip tour is visible, locate "Skip tour" or "Skip" button
2. Click the Skip button
3. Verify tooltip disappears immediately
4. Refresh the page (F5 or Ctrl+R)
5. Wait 5 seconds after page loads
6. Observe if tour reappears

**Expected Result**: ✅ PASS
- Tour dismisses immediately on Skip click
- After page refresh, tour does NOT reappear
- Dashboard loads normally without tour
- localStorage `tour_completed` is set to `'true'`

**What Was Implemented**:
- Skip button in TooltipTour component
- Sets `localStorage.setItem('tour_completed', 'true')`
- Dashboard checks localStorage before showing tour
- Persistent across sessions

**If FAIL**:
- Tour reappears after refresh → Check localStorage in browser DevTools
- Expected: `tour_completed: "true"`
- If missing → Bug in localStorage save logic

---

### TEST 5: Dismiss/Close Tour Functionality ✅ HIGH PRIORITY
**Objective**: Verify tour can be dismissed and stays dismissed

**Steps**:
1. If tour is visible, look for X button or "Dismiss" button
2. Click the dismiss/close button
3. Navigate to "Analytics" tab, then back to "Overview"
4. Logout and login again
5. Check if tour reappears

**Expected Result**: ✅ PASS
- Tour closes immediately on dismiss
- Tour does NOT reappear during tab navigation
- After logout/login, tour does NOT reappear
- State persists via localStorage

**What Was Implemented**:
- `enableDismiss={true}` prop in TooltipTour
- Dismiss action saves to localStorage
- useOnboarding hook has `isInitialized` state
- localStorage caching prevents repeated API calls

**If FAIL**:
- Tour reappears → Check localStorage persistence
- Check browser console for state management errors

---

## Additional Quality Checks

### TEST 6: Error Boundary Protection
**Objective**: Verify app doesn't crash if tour fails

**Steps**:
1. Open browser DevTools (F12) → Console tab
2. Navigate through dashboard normally
3. Look for any uncaught errors or warnings

**Expected Result**: ✅ PASS
- No uncaught errors in console
- If tour fails to load, error is caught gracefully
- Dashboard remains functional even if tour breaks

**What Was Implemented**:
- ErrorBoundary wrapper around TooltipTour in Dashboard.tsx
- Prevents tour errors from crashing the app

---

### TEST 7: Onboarding Progress Persistence
**Objective**: Verify onboarding state survives page refresh

**Steps**:
1. Open browser DevTools → Application/Storage → Local Storage
2. Check for key: `onboarding_data`
3. Refresh page multiple times
4. Verify data remains consistent

**Expected Result**: ✅ PASS
- `onboarding_data` exists in localStorage
- Contains: `user_id`, `completion_percentage`, `current_step`, etc.
- Data persists across refreshes
- No repeated API calls to fetch onboarding data

**What Was Implemented**:
- `useOnboarding.ts` caches data to localStorage
- Checks localStorage before making API calls
- `isInitialized` flag prevents duplicate fetches

---

## Testing Results Template

### Test Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Header Errors | ⬜ PASS / ⬜ FAIL | |
| 2. Tooltip Tour Appearance | ⬜ PASS / ⬜ FAIL | |
| 3. Navigation While Active | ⬜ PASS / ⬜ FAIL | |
| 4. Skip Functionality | ⬜ PASS / ⬜ FAIL | |
| 5. Dismiss Functionality | ⬜ PASS / ⬜ FAIL | |
| 6. Error Boundaries | ⬜ PASS / ⬜ FAIL | |
| 7. Progress Persistence | ⬜ PASS / ⬜ FAIL | |

---

## Technical Implementation Summary

### Files Modified
1. **src/hooks/useSubscription.ts**
   - Added 10-second timeout using Promise.race
   - Graceful degradation: errors logged, not shown to users
   - Default to Free Plan on failure

2. **src/hooks/useOnboarding.ts**
   - Added `isInitialized` state to prevent duplicate API calls
   - localStorage caching for onboarding data
   - Graceful defaults on API failure

3. **src/components/Dashboard.tsx**
   - Removed OnboardingModal import and rendering
   - Removed subscription error banner from header
   - Added TooltipTour component with ErrorBoundary
   - Added 3-second delay before tour activation
   - Checks completion < 50% before showing tour

4. **src/components/GuidedTour/TooltipTour.tsx** (NEW - 305 lines)
   - Non-blocking tooltip-based tour
   - Positioning logic for tooltip placement
   - Skip and dismiss functionality
   - localStorage persistence

5. **src/config/tourSteps.ts** (NEW - 96 lines)
   - Tour step definitions
   - Target selectors and positioning
   - Step descriptions and titles

### Key UX Improvements
✅ **Trust Preservation**: No error messages shown to users  
✅ **User Agency**: Can skip/dismiss tour anytime  
✅ **Non-Blocking**: Dashboard remains fully interactive  
✅ **State Persistence**: Progress saved to localStorage  
✅ **Error Resilience**: ErrorBoundary prevents crashes  
✅ **Performance**: Reduced API calls via caching  
✅ **Progressive Disclosure**: Tour appears only when needed  

---

## Debugging Guide

### If Test Fails, Check:

**Browser Console (F12 → Console)**:
- Look for errors from TooltipTour or useOnboarding
- Check for API failures from Supabase
- Verify no "Maximum update depth exceeded" warnings

**LocalStorage (F12 → Application → Local Storage)**:
- `tour_completed`: Should be `"true"` after skip/dismiss
- `onboarding_data`: Should contain user's onboarding state
- `onboarding_completion_percentage`: Number between 0-100

**Network Tab (F12 → Network)**:
- Check if `/onboarding-data` API call succeeds
- Verify subscription API isn't showing 500 errors to UI
- Timeout should trigger after 10 seconds max

**React DevTools** (if installed):
- Check Dashboard component state
- Verify `showGuidedTour` state
- Check TooltipTour props and state

---

## Success Criteria

All tests must PASS for production readiness:
- ✅ No error messages in header
- ✅ Small tooltip tour (not full-screen modal)
- ✅ Dashboard interactive during tour
- ✅ Skip/dismiss works and persists
- ✅ No console errors
- ✅ State persists across sessions

---

## Contact for Issues

If any test fails:
1. Take screenshot of the issue
2. Open browser console and copy any errors
3. Check localStorage values
4. Report findings with:
   - Test number that failed
   - Screenshot
   - Console errors
   - localStorage values
   - Steps to reproduce

---

**AUTOMATED TESTING STATUS**: ❌ Browser connection unavailable (ECONNREFUSED ::1:9222)  
**MANUAL TESTING**: ✅ Required - Use this guide for comprehensive validation
