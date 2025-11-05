# Phase 1 - Manual Testing Guide

## Deployment Information
**Live URL**: https://snqmmy7ratsa.space.minimax.io
**Build Status**: ✅ SUCCESS
**Bundle Size**: 1,228 KB (262 KB gzipped)

---

## Pre-Test Checklist

### Build Verification
- ✅ TypeScript compilation: SUCCESS (no errors)
- ✅ All components compiled successfully
- ✅ New components included:
  - ✅ HashtagAnalytics.tsx
  - ✅ StoriesReelsAnalytics.tsx
  - ✅ FollowerGrowthChart.tsx (updated - no sample data)
  - ✅ AdvancedAnalyticsDashboard.tsx (updated - 5 tabs)
- ✅ Production build created
- ✅ Deployed successfully

---

## Testing Steps

### 1. Initial Access
**URL**: https://snqmmy7ratsa.space.minimax.io

**Expected**:
- Login page loads
- Email and password fields visible
- "Sign In" button present
- No console errors

**Test**:
- [ ] Page loads successfully
- [ ] Login form displays correctly
- [ ] Responsive on mobile/tablet/desktop

---

### 2. Authentication
**Credentials**: 
- Email: test@example.com
- Password: testpassword123

**Expected**:
- Login successful
- Redirect to dashboard
- User email displayed in sidebar

**Test**:
- [ ] Login works
- [ ] Dashboard loads
- [ ] User info displayed

---

### 3. Dashboard Navigation
**Expected**:
- Sidebar visible with 3 main tabs:
  1. Overview
  2. Advanced Analytics
  3. Accounts

**Test**:
- [ ] All 3 tabs visible
- [ ] Tab switching works smoothly
- [ ] Active tab highlighted

---

### 4. Advanced Analytics - Tab Structure
**Click**: "Advanced Analytics" in sidebar

**Expected**:
- Premium tab navigation with 5 sub-tabs:
  1. Follower Growth (blue gradient)
  2. Post Performance (purple-pink gradient)
  3. Demographics (indigo gradient)
  4. Hashtag Analytics (green gradient)
  5. Stories & Reels (orange-red gradient)

**Test**:
- [ ] All 5 sub-tabs visible
- [ ] Tab cards display with gradients
- [ ] Icons displayed correctly
- [ ] Descriptions visible

---

### 5. Follower Growth Analytics
**Click**: "Follower Growth" sub-tab

**Without Account Selected**:
- Empty state message
- "Advanced Analytics Dashboard" heading
- "Select an Instagram account..." message
- Feature list showing what's available

**With Account Selected** (after adding account):
- Growth chart (area chart)
- Time range selector (7d, 30d, 90d)
- 3 metric cards (Total Growth, Avg Daily Growth, Current Followers)
- Daily net growth chart

**Test**:
- [ ] Empty state displays correctly
- [ ] No sample/fake data shown
- [ ] Empty state message clear and helpful
- [ ] (With account) Charts render properly
- [ ] (With account) Time range selector works

---

### 6. Post Performance Analytics
**Click**: "Post Performance" sub-tab

**Without Data**:
- Empty state message
- "No Post Performance Data Yet"
- Guidance on how to get data

**With Data**:
- 4 performance metric cards
- Content type distribution pie chart
- Top performing posts list
- Recent posts engagement bar chart

**Test**:
- [ ] Empty state displays correctly
- [ ] No sample/fake data shown
- [ ] Clear messaging about data requirements
- [ ] (With data) All charts render
- [ ] (With data) Metrics calculate correctly

---

### 7. Audience Demographics
**Click**: "Demographics" sub-tab

**Without Data**:
- Empty state message
- "No Demographics Data Yet"
- Explanation of what will be shown

**With Data**:
- Age distribution pie chart
- Gender distribution pie chart
- Top countries bar visualization
- Active hours bar chart
- Active days bar chart
- Device types breakdown
- Language distribution

**Test**:
- [ ] Empty state displays correctly
- [ ] No sample/fake data shown
- [ ] Helpful guidance provided
- [ ] (With data) All charts render
- [ ] (With data) Data formatted correctly

---

### 8. Hashtag Analytics
**Click**: "Hashtag Analytics" sub-tab

**Without Data**:
- Empty state message
- "No Hashtag Data Yet"
- Step-by-step guide: "How to Start Tracking"
- 3-step process shown

**With Data**:
- 4 stats cards (Total Hashtags, Avg Engagement, Top Performer, Total Reach)
- Top hashtags bar chart
- Performance radar chart
- All tracked hashtags list

**Test**:
- [ ] Empty state displays correctly
- [ ] No sample/fake data shown
- [ ] Clear instructions provided
- [ ] (With data) Charts render properly
- [ ] (With data) Hashtag list displays

---

### 9. Stories & Reels Analytics
**Click**: "Stories & Reels" sub-tab

**Without Data**:
- Empty state message
- "No Stories or Reels Data Yet"
- "What You'll See Here" section
- 4-point feature list
- Note about API integration

**With Data**:
- 4 stats cards (Total Stories, Avg Views, Completion Rate, Total Reach)
- Views & Reach bar chart
- Completion & Engagement line chart
- Content type distribution
- Recent stories list

**Test**:
- [ ] Empty state displays correctly
- [ ] No sample/fake data shown
- [ ] Feature preview shown
- [ ] API note displayed
- [ ] (With data) All metrics display
- [ ] (With data) Charts render

---

### 10. Accounts Tab
**Click**: "Accounts" in sidebar

**Expected**:
- "Add Instagram Account" button
- List of connected accounts (if any)
- Account selection functionality

**Test**:
- [ ] Can add Instagram account
- [ ] Account list displays
- [ ] Account selection works
- [ ] Selected account shows in analytics

---

### 11. Data Flow Testing
**After Adding Account**:

1. Add Instagram account (e.g., @nike, @cocacola)
2. Wait for data fetch
3. Return to Advanced Analytics
4. Verify data populates in all tabs

**Test**:
- [ ] Account fetch works
- [ ] Data saves to database
- [ ] Analytics tabs show real data
- [ ] No sample data mixed with real data

---

### 12. Empty State Verification

**Critical Requirement**: NO SAMPLE DATA

**Verify for each analytics tab**:
- [ ] Follower Growth - Empty state (no random follower numbers)
- [ ] Post Performance - Empty state (no fake posts)
- [ ] Demographics - Empty state (no random percentages)
- [ ] Hashtag Analytics - Empty state (no placeholder hashtags)
- [ ] Stories & Reels - Empty state (no sample stories)

**Each empty state must**:
- Show clear message explaining why empty
- Provide guidance on how to populate data
- Use branded design (gradients, icons)
- NO random/generated/sample data

---

### 13. Responsive Design
**Test on different viewports**:

**Desktop (1920px)**:
- [ ] Full sidebar visible
- [ ] 5 analytics tabs in single row (or 2 rows)
- [ ] Charts render full width
- [ ] All metrics visible

**Tablet (768px)**:
- [ ] Sidebar toggles
- [ ] Analytics tabs wrap to 2-3 per row
- [ ] Charts responsive
- [ ] Touch-friendly buttons

**Mobile (375px)**:
- [ ] Sidebar collapses to hamburger
- [ ] Analytics tabs stack vertically
- [ ] Charts scale to mobile
- [ ] All features accessible

---

### 14. Dark Mode
**Toggle dark mode** (if available):

**Test**:
- [ ] All components support dark mode
- [ ] Charts readable in dark mode
- [ ] Contrast ratios appropriate
- [ ] No visual glitches

---

### 15. Performance
**Metrics to check**:

- [ ] Page load < 3 seconds
- [ ] Tab switching instant
- [ ] Charts render smoothly
- [ ] No lag when clicking buttons
- [ ] Refresh works quickly

---

### 16. Console Errors
**Open browser console**:

**Check**:
- [ ] No JavaScript errors
- [ ] No API errors (except expected auth)
- [ ] No broken image links
- [ ] No missing resources

---

## Success Criteria

### MUST PASS (Critical)
- ✅ All 5 analytics tabs present and accessible
- ✅ NO sample/fake data displayed anywhere
- ✅ Empty states display with helpful messages
- ✅ Real data (when available) displays correctly
- ✅ No console errors

### SHOULD PASS (Important)
- Charts render correctly with real data
- Responsive on all devices
- Dark mode works (if implemented)
- Performance is acceptable
- All navigation smooth

### NICE TO HAVE
- Animations smooth
- Loading states pleasant
- Error messages helpful
- Visual polish high quality

---

## Test Results Template

### Date: _______
### Tester: _______
### URL: https://snqmmy7ratsa.space.minimax.io

| Test Section | Status | Notes |
|--------------|--------|-------|
| 1. Initial Access | PASS/FAIL | |
| 2. Authentication | PASS/FAIL | |
| 3. Dashboard Navigation | PASS/FAIL | |
| 4. Advanced Analytics Tabs | PASS/FAIL | |
| 5. Follower Growth | PASS/FAIL | |
| 6. Post Performance | PASS/FAIL | |
| 7. Demographics | PASS/FAIL | |
| 8. Hashtag Analytics | PASS/FAIL | |
| 9. Stories & Reels | PASS/FAIL | |
| 10. Accounts Tab | PASS/FAIL | |
| 11. Data Flow | PASS/FAIL | |
| 12. Empty States (No Sample Data) | PASS/FAIL | |
| 13. Responsive Design | PASS/FAIL | |
| 14. Dark Mode | PASS/FAIL | |
| 15. Performance | PASS/FAIL | |
| 16. Console Errors | PASS/FAIL | |

**OVERALL**: PASS / FAIL

**Critical Issues Found**: _______________

**Recommendations**: _______________

---

## Quick Test (5 minutes)

For rapid verification:

1. Login ✓
2. Click "Advanced Analytics" ✓
3. Verify 5 tabs present ✓
4. Click each tab, verify empty state (no sample data) ✓
5. Check console for errors ✓

If all 5 steps pass, proceed to full testing.

---

## Notes

- Browser testing tools are not available in this environment
- Manual testing required
- Screenshots recommended for documentation
- Test with real Instagram accounts for full verification

**Ready for manual testing at**: https://snqmmy7ratsa.space.minimax.io
