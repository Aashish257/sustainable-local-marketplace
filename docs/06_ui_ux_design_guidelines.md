# 🎨 Document 6: UI/UX Design Guidelines

This document presents the visual design system, glassmorphism CSS rules, UI transition keyframes, SVG icon standards, and Three.js/WebGL specifications for the Sustainable Local Marketplace.

---

## 1. Visual Aesthetics & Palette

The platform uses a premium, responsive glassmorphic aesthetic centered around Emerald and Sage greens.

```
       Emerald Green (Primary Accent)         Sage Slate (Secondary Ambient)
       ┌────────────────────────────┐         ┌────────────────────────────┐
       │   HEX #059669 / #10b981    │         │   HEX #f4f5f4 / #3a423c    │
       └────────────────────────────┘         └────────────────────────────┘
```

### 1.1 Typography
- **Core Font Family**: Google Font `Outfit`, sans-serif.
- **Fallbacks**: `ui-sans-serif`, `system-ui`, `-apple-system`.
- **Properties**: Set `font-smoothing: antialiased` for clean text rendering over colored gradients.

---

## 2. Glassmorphism Design System

Frosted-glass borders, light refraction, and internal glow layers are enforced through utility definitions:

### 2.1 CSS Utility Specifications

```css
/* Standard Frosted Glass Layer */
@utility glass {
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

/* Glass Card (Dark/Neutral Backgrounds) */
@utility glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 
              0 8px 32px 0 rgba(16, 185, 129, 0.02);
}

/* Glass Card Light (High Contrast/White Backgrounds) */
@utility glass-card-light {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 
              0 8px 32px 0 rgba(0, 0, 0, 0.03);
}

/* Glass Card Dark (Dark Theme Overrides) */
@utility glass-card-dark {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 
              0 8px 32px 0 rgba(0, 0, 0, 0.2);
}

/* Green Glass (Green Accent Theme) */
@utility glass-green {
  background-color: rgba(5, 150, 105, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(5, 150, 105, 0.15);
}
```

---

## 3. Micro-Animations & GPU Keyframes

Cards and interactive panels implement smooth, hardware-accelerated triggers:

### 3.1 Glass Shimmer sweep glare (`glass-shimmer`)
Uses a skewed linear-gradient background offset that transitions left-to-right on element hover:
```css
.glass-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.15) 30%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  pointer-events: none;
}
.glass-shimmer:hover::after {
  left: 200%;
  transition: left 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 3.2 Hover Lift & Emerald Glow (`hover-card-trigger`)
Staggers component placement on hover to create depth:
```css
.hover-card-trigger {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.hover-card-trigger:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 20px 40px -15px rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.25) !important;
}
```

### 3.3 Background GPU Wander Blobs
Two separate radial-gradient blurred background circles wander asynchronously using GPU transforms to produce visual warmth:
- `wander-blob-1`: Moves from top-left, scaling up to `1.12`, then drifts down-right.
- `wander-blob-2`: Wanders diagonally on a 22-second loop.

---

## 4. Three.js WebGL Canvas Guidelines

The Landing Page (`HomePage.jsx`) embeds a raw canvas rendering custom 3D animations:

```
    ThreeJS Viewport Resize Listeners
          │
          ├──► Throttle pixel ratio: min(window.devicePixelRatio, 2)
          │
          └──► Leaf Particle Drift System
                 ├── sin() horizontal sway
                 ├── cos() rotation wobble
                 └── scrollY vertical parallax offset
```

### 4.1 Leaf Particle Drift System
- Renders a floating 3D particle array representing green leaves drifting.
- Positions are offset during mouse movement and scroll events (Parallax multiplication factor `0.05`).
- Sines and Cosines (`Math.sin()`, `Math.cos()`) wobble the orientation and drift speed.

### 4.2 WebGL Performance & Memory Cleanup
1. **DPR Cap**: Limit renderer pixel ratio to `Math.min(window.devicePixelRatio, 2)` to avoid performance drops on 4K displays.
2. **Memory Leak Disposal**: When components unmount, the frontend MUST invoke cleanup methods:
   - Call `.dispose()` on all geometries.
   - Call `.dispose()` on all materials and textures.
   - Remove global event listeners (scroll, resize, mousemove).
   - Terminate the `requestAnimationFrame` loop.

---

## 5. Icon Standards (SVG Only)
Raw text emojis are banned in production templates. Replace icons with customized inline SVG markup:
- **Style**: Stroke-width line-art (stroke-width: `2px`, linecap: `round`, linejoin: `round`).
- **Standard colors**: `currentColor` (Inherits parent theme styles).

---

## 6. Theme Engine Synchronization (Dark Mode)
Dark theme uses a `.dark` parent selector hook:
- **Theme check**: Navbar reads client LocalStorage key `theme` or falls back to system preferences (`prefers-color-scheme`).
- **Visual Overrides**:
  - Light background (`#f8faf9`) switches to deep slate (`#0a0f0d`).
  - Font colors (`text-slate-900`, `text-slate-700`) override to high contrast slates (`#f8fafc`, `#e2e8f0`).
  - Transition duration is standardized to `300ms ease` globally.
