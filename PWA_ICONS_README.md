# PWA Icon Generation Guide

## Required Icons

The manifest.json references these icon files that need to be created:

1. **pwa-icon-192.png** (192x192 pixels)
2. **pwa-icon-512.png** (512x512 pixels)

## How to Generate Icons

### Option 1: Online Tools (Recommended)
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload your logo or profile photo (my-photo.jpg)
3. Download the generated icon pack
4. Place the 192x192 and 512x512 icons in `assets/icons/`

### Option 2: Manual Creation
Use image editing software (Photoshop, GIMP, Figma):
1. Create a 512x512 canvas
2. Add your logo/brand with padding
3. Export as PNG
4. Resize to 192x192 for the smaller icon

### Option 3: Using Existing Favicon
If you want to use the existing favicon.png:
1. Resize favicon.png to 192x192 and 512x512
2. Save as pwa-icon-192.png and pwa-icon-512.png
3. Place in assets/icons/ folder

## Icon Guidelines

- **Format:** PNG with transparency
- **Content:** Should be recognizable at small sizes
- **Padding:** Leave 10% padding around the main content
- **Background:** Can be transparent or solid color
- **Purpose:** "maskable" icons should have important content in the safe zone (center 80%)

## Current Status

✅ manifest.json created and linked
✅ Service worker created (sw.js)
✅ PWA meta tags added
⏳ Icons need to be generated and placed in assets/icons/

## Testing PWA

After adding icons:
1. Deploy to GitHub Pages
2. Open in Chrome on mobile
3. Look for "Install app" prompt
4. Test offline functionality
5. Verify icon appears correctly

## Fallback

Currently using favicon.png (64x64) as fallback. The app will still work but won't have optimal icons for installation.
