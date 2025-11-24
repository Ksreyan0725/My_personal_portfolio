---
description: Implement swipe gestures across all pages with context-aware behavior
---

# Swipe Gesture Implementation Plan

## Overview
Implement touch swipe gestures across the entire portfolio website with intelligent, context-aware behavior:
- **index.html**: Swipe from left edge → Opens sidebar menu
- **Other pages** (contact.html, thank-you.html, maintenance.html): Swipe from left edge → Browser back navigation

## Architecture

### Shared Resources
- **CSS**: `style.css` (already contains swipe indicator styles)
- **JavaScript**: `script.js` (contains MobileSidebarSwipe class)

### Implementation Strategy
1. Refactor existing `MobileSidebarSwipe` class into a more generic `SwipeGestureHandler`
2. Add page detection logic to determine which behavior to use
3. Create two swipe modes:
   - `sidebar` mode: Opens/closes sidebar (index.html only)
   - `back` mode: Navigates back in browser history (all other pages)
4. Ensure all pages load the same script.js file

## Detailed Steps

### Step 1: Analyze Current Page Structure
- [x] Review which pages exist in the project
- [x] Identify which pages have sidebar menus
- [x] Check how script.js is currently loaded across pages

### Step 2: Refactor JavaScript Architecture

#### 2.1: Create Base Swipe Handler Class
Create a new `SwipeGestureHandler` base class that:
- Detects touch events on mobile devices
- Tracks swipe direction, velocity, and distance
- Shows/hides the circular swipe indicator
- Handles edge detection (30px from left edge)

#### 2.2: Create Two Swipe Modes

**Mode 1: Sidebar Mode** (for index.html)
- Extends existing `MobileSidebarSwipe` functionality
- Opens sidebar when swiping right from left edge
- Closes sidebar when swiping left while open
- Shows blue circular indicator with → arrow

**Mode 2: Back Navigation Mode** (for other pages)
- Detects swipe right from left edge
- Shows circular indicator with ← arrow (pointing left)
- Triggers `window.history.back()` on successful swipe
- Includes visual feedback (page slide animation)
- **Scroll Position Restoration**: Automatically restores the exact scroll position of the previous page

#### 2.3: Add Page Detection Logic
```javascript
function detectPageType() {
    // Check if sidebar menu exists in DOM
    const hasSidebar = document.getElementById('sidebarMenu') !== null;
    
    // Check current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (hasSidebar && currentPage === 'index.html') {
        return 'sidebar';
    } else {
        return 'back';
    }
}
```

### Step 3: Update script.js

#### 3.1: Modify Initialization Logic
Replace current initialization (lines 553-589) with:
```javascript
// Auto-detect page type and initialize appropriate swipe handler
if (window.innerWidth <= 768) {
    const pageType = detectPageType();
    
    if (pageType === 'sidebar') {
        // Initialize sidebar swipe (existing functionality)
        const sidebarSwipe = new MobileSidebarSwipe({...});
    } else {
        // Initialize back navigation swipe (new functionality)
        const backSwipe = new BackNavigationSwipe({...});
    }
}
```

#### 3.2: Create BackNavigationSwipe Class
New class that handles swipe-to-go-back:
- Similar structure to MobileSidebarSwipe
- Uses same indicator styles
- Arrow points left (←) instead of right (→)
- Calls `window.history.back()` on successful swipe
- Optional: Add page slide-out animation

#### 3.3: Implement Scroll Position Restoration
**Automatic Scroll Position Tracking:**

```javascript
// Save scroll position before navigation
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('scrollPos_' + window.location.pathname, window.scrollY);
});

// Restore scroll position on page load
window.addEventListener('load', () => {
    const savedPosition = sessionStorage.getItem('scrollPos_' + window.location.pathname);
    if (savedPosition !== null) {
        window.scrollTo(0, parseInt(savedPosition));
    }
});

// Alternative: Use History API for more reliable restoration
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.scrollPos !== undefined) {
        setTimeout(() => {
            window.scrollTo(0, event.state.scrollPos);
        }, 0);
    }
});

// Save scroll position to history state before navigating away
function saveScrollPosition() {
    const currentState = history.state || {};
    history.replaceState({
        ...currentState,
        scrollPos: window.scrollY,
        timestamp: Date.now()
    }, '', window.location.href);
}

// Call before navigation
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && !e.target.hasAttribute('target')) {
        saveScrollPosition();
    }
});
```

**Integration with BackNavigationSwipe:**
- Save scroll position when user initiates swipe
- Browser's native `history.back()` will automatically restore scroll position
- Use `history.scrollRestoration = 'manual'` if custom control is needed
- Fallback to sessionStorage for browsers with limited History API support


### Step 4: Update CSS (style.css)

#### 4.1: Add Back Navigation Indicator Variant
```css
/* Swipe indicator for back navigation - arrow points left */
.swipe-indicator.back-mode .arrow {
    transform: rotate(180deg); /* Flip arrow to point left */
}

/* Optional: Page slide animation for back navigation */
@keyframes pageSlideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0.8;
    }
}

.page-sliding-back {
    animation: pageSlideOut 0.3s ease-out forwards;
}
```

### Step 5: Verify Page Integration

#### 5.1: Check All HTML Pages
Ensure all pages include script.js:
- ✓ index.html
- ✓ contact.html
- ✓ thank-you.html
- ✓ maintenance.html

#### 5.2: Test Scenarios
1. **index.html on mobile**:
   - Swipe from left edge → Sidebar opens
   - Swipe left on sidebar → Sidebar closes
   
2. **contact.html on mobile**:
   - Swipe from left edge → Goes back to previous page
   - No sidebar functionality
   
3. **thank-you.html on mobile**:
   - Swipe from left edge → Goes back to previous page
   
4. **maintenance.html on mobile**:
   - Swipe from left edge → Goes back to previous page

### Step 6: Add Safety Features

#### 6.1: Prevent Unwanted Back Navigation
- Only allow back swipe if `window.history.length > 1`
- Show visual feedback if back navigation is not available
- Fallback: Navigate to index.html if no history

#### 6.2: Disable on Desktop
- Ensure swipe gestures only work on mobile (max-width: 768px)
- Desktop users continue using normal navigation

### Step 7: Performance Optimization

#### 7.1: Lazy Load Swipe Handler
- Only initialize swipe handler after DOM is ready
- Use `requestAnimationFrame` for smooth animations
- Debounce resize events

#### 7.2: Memory Management
- Clean up event listeners when page unloads
- Remove indicator element when not needed

## File Changes Summary

### Files to Modify:
1. **script.js** (Major changes)
   - Refactor MobileSidebarSwipe class
   - Add BackNavigationSwipe class
   - Add page detection logic
   - Update initialization code

2. **style.css** (Minor changes)
   - Add back-mode indicator styles
   - Add page slide animation (optional)

### Files to Verify:
3. **index.html** - Ensure script.js is loaded
4. **contact.html** - Ensure script.js is loaded
5. **thank-you.html** - Ensure script.js is loaded
6. **maintenance.html** - Ensure script.js is loaded

## Testing Checklist

### Mobile Testing (Real Device)
- [ ] index.html: Swipe opens sidebar
- [ ] index.html: Swipe closes sidebar
- [ ] contact.html: Swipe goes back
- [ ] thank-you.html: Swipe goes back
- [ ] maintenance.html: Swipe goes back
- [ ] Indicator appears and follows finger
- [ ] Velocity-based swipe detection works
- [ ] Edge detection (30px) works correctly
- [ ] **Scroll position restoration**: Navigate from index.html (scrolled down) → contact.html → swipe back → returns to exact scroll position on index.html
- [ ] **Scroll position restoration**: Test with multiple pages in history
- [ ] **Scroll position restoration**: Works after page refresh (sessionStorage fallback)

### Desktop Testing
- [ ] No swipe functionality on desktop
- [ ] All pages work normally with mouse/keyboard

### Edge Cases
- [ ] Back swipe on first page (no history)
- [ ] Rapid swipes don't cause issues
- [ ] Swipe during page load
- [ ] Swipe while scrolling vertically

## Implementation Order

1. **First**: Create BackNavigationSwipe class in script.js
2. **Second**: Implement scroll position restoration system (sessionStorage + History API)
3. **Third**: Add page detection logic
4. **Fourth**: Update initialization to use page detection
5. **Fifth**: Add CSS for back-mode indicator
6. **Sixth**: Test on all pages
7. **Seventh**: Add safety features and edge case handling
8. **Final**: Performance optimization and cleanup

## Expected User Experience

### On index.html (Mobile):
1. User touches left edge of screen
2. Blue circular indicator appears with → arrow
3. User drags right, indicator follows finger
4. Sidebar slides in with glow effect
5. User can swipe left to close

### On other pages (Mobile):
1. User touches left edge of screen
2. Blue circular indicator appears with ← arrow
3. User drags right, indicator follows finger
4. Page slides out to the right
5. Browser navigates back to previous page
6. **Previous page automatically scrolls to the exact position the user was at before**
7. Smooth transition with no jarring jumps

### On Desktop (All pages):
- No swipe functionality
- Normal navigation works as expected

## Notes
- All swipe gestures are touch-only (no mouse support)
- Swipe threshold: 50px minimum distance
- Velocity threshold: 0.3 for quick swipes
- Edge detection: 30px from left edge
- Mobile breakpoint: max-width 768px
- Indicator color: Sky blue (#0ea5e9)

### Scroll Position Restoration Details
**How it works:**
1. **History API (Primary Method)**: 
   - Browser automatically saves scroll position in history state
   - `history.back()` restores the position natively
   - Most reliable for modern browsers

2. **Manual Tracking (Fallback)**:
   - Save scroll position to `sessionStorage` before navigation
   - Key format: `scrollPos_/path/to/page`
   - Restore on page load if History API fails

3. **Implementation Strategy**:
   - Use `history.scrollRestoration = 'auto'` (browser handles it)
   - Add manual tracking as backup for older browsers
   - Track scroll position on `beforeunload` event
   - Restore on `load` or `popstate` events

4. **Edge Cases Handled**:
   - Page refresh: sessionStorage persists
   - Multiple back navigations: Each page has its own saved position
   - Forward navigation: Browser handles automatically
   - New tab: No scroll position (expected behavior)

**Browser Compatibility:**
- Modern browsers (Chrome 46+, Firefox 46+, Safari 11+): Native scroll restoration
- Older browsers: sessionStorage fallback
- iOS Safari: Fully supported with History API
- Android Chrome: Fully supported
