# Render-Lock Reconstruction Method

Use this method when an approved visual render must be matched exactly before rebuilding it as individual components.

## Canonical reference

- Approved viewport: `1536 × 1024`
- The approved render is the visual source of truth.
- Pixel accuracy is judged at the canonical viewport first.
- Other viewport sizes scale the approved surface proportionally until a separate responsive composition is approved.

## Method

1. Freeze the approved render. Do not reinterpret, regenerate, or procedurally approximate its artwork.
2. Export the approved render at its native dimensions in a web-compatible format.
3. Use the approved render as the visible page surface.
4. Preserve its aspect ratio exactly; never stretch one axis independently.
5. Place semantic, transparent interaction areas over rendered controls using percentage coordinates.
6. Keep all production links internal until real project destinations are approved.
7. Version the asset and loader URLs to prevent stale browser/CDN caches.
8. Include an explicit loading/error state so a missing asset cannot silently become a black page.
9. Validate at the canonical viewport with a browser screenshot and image-difference comparison.
10. Only after approval, optionally replace individual rendered regions with live HTML/CSS one section at a time, retaining the render beneath as a comparison layer.

## Why this worked

The strand artwork includes complex depth-of-field blur, irregular wisps, particle placement, glow falloff, and photographic imperfections. Recreating that material procedurally produced a different image even when the overall composition was similar. Using the approved artwork directly preserves every strand and pixel.

## Production implementation

- `assets/render-lock.b64` stores the approved WebP surface.
- `render-lock.js` loads and validates the asset before displaying it.
- `render-lock.css` preserves the canonical aspect ratio and positions interaction hit areas.
- `index.html` contains only the semantic render surface, internal anchors, and transparent interaction areas.

## Acceptance checklist

- [ ] Screenshot at `1536 × 1024` visually matches the approved render.
- [ ] No procedural canvas artwork is loaded.
- [ ] No external or Solace links are present.
- [ ] Header and hero controls remain keyboard accessible.
- [ ] Asset failure displays a visible status instead of a blank page.
- [ ] Browser and CDN caches are version-busted after changes.

## Rule

> When the user approves a specific visual render and requests an exact match, reproduce the approved pixels first. Do not substitute a stylistic approximation.
