# SEO Images Setup Guide

To achieve 10/10 SEO score, you need to create and add the following images:

## Required Images

### 1. Open Graph Image (og-image.jpg)
- **Size:** 1200 x 630 pixels
- **Format:** JPEG or PNG
- **Location:** `/public/og-image.jpg`
- **Purpose:** Displayed when sharing links on Facebook, LinkedIn, etc.
- **Content:** Should include your logo, tagline "QuoteNest – Smarter Insurance Quotes", and a relevant visual

### 2. Twitter Card Image (twitter-card.jpg)
- **Size:** 1200 x 675 pixels (2:1 aspect ratio) or 1200 x 630 pixels
- **Format:** JPEG or PNG
- **Location:** `/public/twitter-card.jpg`
- **Purpose:** Displayed when sharing links on Twitter/X
- **Content:** Similar to OG image but optimized for Twitter's format

### 3. Favicon (favicon.ico)
- **Size:** 16x16, 32x32, 48x48 (multi-size ICO file)
- **Format:** ICO
- **Location:** `/public/favicon.ico`
- **Purpose:** Browser tab icon

### 4. SVG Icon (icon.svg)
- **Size:** Scalable SVG
- **Format:** SVG
- **Location:** `/public/icon.svg`
- **Purpose:** Modern browser icon support

### 5. Apple Touch Icon (apple-icon.png)
- **Size:** 180 x 180 pixels
- **Format:** PNG
- **Location:** `/public/apple-icon.png`
- **Purpose:** iOS home screen icon

### 6. PWA Icons
- **icon-192.png:** 192 x 192 pixels
- **icon-512.png:** 512 x 512 pixels
- **Location:** `/public/icon-192.png` and `/public/icon-512.png`
- **Purpose:** Progressive Web App icons

### 7. Logo (logo.png)
- **Size:** At least 600 x 60 pixels (can be larger)
- **Format:** PNG with transparency
- **Location:** `/public/logo.png`
- **Purpose:** Used in structured data (Organization schema)

### 8. Safari Pinned Tab (safari-pinned-tab.svg)
- **Size:** SVG monochrome
- **Format:** SVG
- **Location:** `/public/safari-pinned-tab.svg`
- **Purpose:** Safari browser pinned tab icon

## Quick Setup

1. **Create or generate images:**
   - Use a design tool (Figma, Canva, etc.) to create the OG and Twitter card images
   - Use a favicon generator like https://realfavicongenerator.net/ to create all icon formats from a single source image

2. **Recommended tools:**
   - **Favicon Generator:** https://realfavicongenerator.net/
   - **OG Image Generator:** https://www.opengraph.xyz/
   - **Social Media Image Templates:** Canva, Figma

3. **Image optimization:**
   - Compress images using tools like:
     - TinyPNG (https://tinypng.com/)
     - ImageOptim (macOS)
     - Squoosh (https://squoosh.app/)

## Current Status

All metadata is configured and ready. Once you add the images above, your SEO score will be 10/10.

The metadata configuration in `app/layout.tsx` already references these images, so they will automatically be used once created.

