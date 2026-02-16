# E&W Brand Tokens

Design tokens extracted from the **E&W Brand Handoff** Figma file (Section 08: Product & Interface).

## What's Inside

```
ew-brand-tokens/
├── tokens.json           # Universal design tokens (JSON)
├── ew-brand.css          # CSS custom properties (works anywhere)
├── tailwind-preset.js    # Tailwind CSS preset (v3/v4)
└── README.md
```

## Quick Start

### Any project (CSS variables)

1. Add fonts to your `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

2. Import the CSS file:
```css
@import './ew-brand-tokens/ew-brand.css';
```

3. Use variables:
```css
body {
  font-family: var(--ew-font-body);
  background: var(--ew-background);
  color: var(--ew-foreground);
}
h1, h2 {
  font-family: var(--ew-font-heading);
}
.btn-primary {
  background: var(--ew-primary);
  color: var(--ew-primary-foreground);
  border-radius: var(--ew-radius-md);
}
```

### Tailwind CSS

```js
// tailwind.config.js
import ewBrand from './ew-brand-tokens/tailwind-preset.js'

export default {
  presets: [ewBrand],
}
```

Then use: `bg-primary`, `text-muted-foreground`, `font-heading`, `shadow-card-hover`, etc.

### tokens.json (for any tool)

The JSON file follows the [W3C Design Tokens](https://design-tokens.github.io/community-group/format/) format and can be imported into:
- Style Dictionary
- Figma Tokens Studio
- Storybook
- Any custom build pipeline

## Brand Overview

| Element | Value |
|---|---|
| **Heading Font** | DM Serif Display (serif, weight 400) |
| **Body Font** | Inter (sans-serif) |
| **Primary Color** | `#1a1a1a` (near-black) |
| **Brand Accent** | `#CFCCAE` (olive/sage) |
| **Background** | `#f7f7f5` (warm off-white) |
| **Border** | `#e2e0d8` (warm gray) |
| **Border Radius** | 6px (cards), 4px (inputs) |
| **Design Feel** | Premium, minimal, earthy, tech-forward |

## Color Palette

```
Primary:    ██ #1a1a1a  (near-black)
Accent:     ██ #CFCCAE  (olive/sage)
Background: ██ #f7f7f5  (warm off-white)
Secondary:  ██ #f0efe9  (warm light gray)
Border:     ██ #e2e0d8  (warm gray)
Text:       ██ #666666  (secondary text)
            ██ #999891  (tertiary text)

Charts:     ██ #7c9885  (sage green)
            ██ #b8c5a2  (light olive)
            ██ #CFCCAE  (brand olive)
            ██ #8fa5b2  (steel blue)
            ██ #a3927e  (warm taupe)
```

## Source

Figma: `E&W Brand Handoff` → Node `21107-10335` (Product & Interface)
