# Quick Reference: Responsive Breakpoints

## 📐 Breakpoint Overview

| Device | Range | Grid Columns | Navbar |
|--------|-------|-------------|---------|
| 📱 Mobile | 0-600px | 1 column | Hamburger menu |
| 📋 Tablet | 601-1024px | 2 columns | Full nav |
| 💻 Laptop | 1025-1440px | 2-3 columns | Full nav + search |
| 🖥️ Large | 1441px+ | 2-3 columns | Maximum width |

## 🎯 Key Measurements

### Navigation Heights
```css
Mobile: 48px
Tablet: 56px
Laptop: 58px
```

### Content Max-Widths
```css
Tablet: 900px
Laptop: 1200-1300px
Large: 1400-1600px
```

### Hero Section Profile Sidebar
```css
Mobile: 100% (stacked)
Tablet: auto (2-column grid)
Laptop: 380px
Large: 400px
```

## 🔍 Testing Sizes

### Common Mobile Sizes
- **320px** - iPhone SE (small)
- **375px** - iPhone X, 11, 12
- **414px** - iPhone Plus
- **428px** - iPhone 13 Pro Max

### Common Tablet Sizes
- **768px** - iPad Mini, iPad (portrait)
- **810px** - iPad (10.2")
- **834px** - iPad Air (portrait)
- **1024px** - iPad Pro (portrait), iPad (landscape)

### Common Desktop Sizes
- **1280px** - Small laptop
- **1366px** - HD laptop (common)
- **1440px** - Large laptop
- **1920px** - Full HD desktop
- **2560px** - 2K/4K display

## 💡 Media Query Syntax

```css
/* Mobile Base - No media query needed */
.element { ... }

/* Tablet and up */
@media (min-width: 601px) {
    .element { ... }
}

/* Laptop and up */
@media (min-width: 1025px) {
    .element { ... }
}

/* Large screens */
@media (min-width: 1441px) {
    .element { ... }
}
```

## 🎨 Component Behavior

### Navigation
```
Mobile (0-600px):
  ├─ Hamburger icon (left)
  ├─ Search icon (right)
  └─ Theme toggle icon (right)

Tablet (601-1024px):
  ├─ Logo (left)
  ├─ Nav links (center)
  ├─ Search bar (right)
  └─ Theme toggle with text (right)

Laptop+ (1025px+):
  └─ All elements with optimal spacing
```

### Hero Section
```
Mobile: Single column
  ┌───────────────────┐
  │   Profile Photo   │
  │     & Links       │
  ├───────────────────┤
  │   About Content   │
  └───────────────────┘

Tablet+: Two columns
  ┌────────┬──────────────┐
  │Profile │    About     │
  │ Sticky │   Content    │
  │Sidebar │              │
  └────────┴──────────────┘
```

### Skills Grid
```
Mobile: 1 column
Tablet: 2 columns
Laptop: 2 columns (wider)
```

## 🛠️ Quick Fixes

### If navbar overlaps content:
- Check `padding-top` on hero section
- Should match navbar height + banner height

### If text is too small/large:
- Adjust font sizes in respective breakpoint
- Use `rem` units for scalability

### If grid doesn't adapt:
- Check `grid-template-columns` in media queries
- Ensure using `min-width` not `max-width`

### If mobile menu doesn't show:
- Verify `.menu-icon` has `display: flex !important`
- Check `.desktop-nav` is hidden below 601px

## 📱 Testing Checklist

**Visual Check:**
- [ ] Logo appears/disappears correctly
- [ ] Navigation adapts smoothly
- [ ] Hero section switches from 1 to 2 columns
- [ ] Skills grid adapts (1 → 2 columns)
- [ ] Cards have appropriate padding
- [ ] Text is readable at all sizes
- [ ] Images scale proportionally
- [ ] Touch targets ≥ 44px on mobile

**Functional Check:**
- [ ] Hamburger menu works on mobile
- [ ] Search functionality works at all sizes
- [ ] Theme toggle works everywhere
- [ ] All links are clickable
- [ ] Smooth transitions between breakpoints
- [ ] No horizontal scrolling
- [ ] No content cutoff

## 🎯 Common Issues & Solutions

**Issue**: Navbar items crowded
**Solution**: Reduce `gap` or hide non-essential items

**Issue**: Content too wide
**Solution**: Add/adjust `max-width` on container

**Issue**: Text wrapping oddly
**Solution**: Adjust `font-size` or `padding` at breakpoint

**Issue**: Images distorted
**Solution**: Use `object-fit: cover` and `aspect-ratio`

**Issue**: Grid columns wrong number
**Solution**: Check `grid-template-columns` value

---

**Quick Tip**: Use browser DevTools (F12) → Device Toolbar (Ctrl+Shift+M) to test all breakpoints instantly!
