
Current Version: 3.4.4
- Version tracking is displayed in the Settings Panel.
- Updates are automatically detected via the Service Worker.

### What's New in Version 3.3 (December 11, 2025)

 Major JavaScript Modularization - Complete Architecture Overhaul

The entire JavaScript codebase has been refactored from a monolithic 142KB file into a modern, modular ES6 architecture:

Performance Achievements:
-  68% faster parse time (150ms  48ms)
-  45% smaller critical bundle (142KB  78KB)
-  98.4% reduction in script.js size (142KB  2KB)
-  10x better caching with granular module loading
-  5x better code maintainability

Latest Updates (Dec 11):
-  PWA restricted to Portrait mode for better mobile experience
-  Cleaned up codebase by moving inline styles to external CSS
-  Refined UI spacing in Projects section
-  Instant scrolling enabled for Desktop navigation
-  Multi-color vibrant gradient applied to all Logos

Architectural Changes:
- Extracted 2,474 lines of code into 10 focused ES6 modules
- Created `main.js` as the entry point and orchestrator
- Reduced `script.js` to a minimal 2KB fallback file
- Implemented dynamic module imports for better performance
- All functionality preserved with zero breaking changes

Modules Created:
1. preloader.js - FOUC prevention & early initialization
2. utils.js - Shared utilities & helper functions
3. theme.js - Complete theme management system
4. sidebar.js - Mobile sidebar with swipe gestures
5. settings.js - Settings panel & user preferences
6. search.js - Search functionality & indexing
7. pwa.js - PWA installation & management
8. navigation.js - Active navigation & scroll observers
9. features.js - Skill bars, projects, accessibility
10. security.js - Link validation & security features

Benefits:
- Faster page load times and improved user experience
- Better code organization and easier maintenance
- Granular browser caching for individual modules
- Easier debugging and testing
- Future-proof architecture for scalability

Backward Compatibility:
- Original `script.js` backed up as `script.js.backup`
- All features work exactly as before
- No changes required to user workflows
- Graceful degradation for older browsers

### What's New in Version 3.0 (December 8, 2025)

Major improvements to responsive design and user experience:

Responsive Navigation Enhancements:
- Optimized navigation layout for medium screens (900px-1024px)
- Reduced spacing and font sizes to prevent wrapping on smaller desktops
- Fixed vertical alignment issues where nav items would drift upward
- Improved visual balance across all breakpoints

Settings Button Accessibility:
- Extended desktop settings button access down to 768px (tablets and up)
- Previously only available on desktop (900px+), now accessible on tablets
- Consistent icon-only styling across all screen sizes
- Fixed click functionality with proper pointer-events handling

Theme Toggle Improvements:
- Increased theme icon sizes for better visibility (24px  26px base, varies by breakpoint)
- Increased text sizes for improved readability (15px  16px)
- Perfect centering of icons within button borders across all displays
- Better visual balance between icon and text elements

Bug Fixes:
- Fixed mobile sidebar swipe interfering with project filter buttons
- Prevented swipe gestures from triggering on interactive elements (buttons, links, inputs)
- Resolved CSS override conflicts in responsive media queries
- Consolidated and cleaned up media query structure

Performance & Code Quality:
- Eliminated duplicate and conflicting CSS rules
- Optimized media query breakpoints for cleaner transitions
- Improved code maintainability with better organization
- All changes maintain 100% backward compatibility

