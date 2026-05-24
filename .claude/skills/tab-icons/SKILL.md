---
name: tab-icons
description: Convert SVG icons (Phosphor, Heroicons, Lucide, etc.) into PNG assets for NativeTabs and wire them up. Use when the user wants to swap, add, or update bottom-tab icons, or when they ask why tab icons aren't tinting correctly.
---

You are helping manage tab bar icons for this Expo / NativeTabs project.

## Why PNG, not SVG

NativeTabs on iOS maps `<Icon src={...}>` to UIKit's `templateSource`, which renders with `UIImageRenderingModeAlwaysTemplate`. That uses **only the alpha channel** of the image and applies the tab bar's `tintColor` (active) or `iconColor` (inactive) at runtime. The source color baked into the image is discarded.

This is why we cannot pass SVG React elements as the icon source — they render with whatever fill/stroke is baked in and ignore the tab bar's tint colors. Always convert to PNG.

## The conversion script

`scripts/convert-tab-icons.sh` (run via `pnpm icons:convert`):

1. Reads every `.svg` in `assets/icons/tabs/`
2. Replaces `currentColor` with `#000000` so `rsvg-convert` has a concrete color to rasterize (the value is irrelevant because iOS template tinting uses only the alpha channel)
3. Renders each at three densities for retina sharpness: `@1x` (24×24), `@2x` (48×48), `@3x` (72×72)
4. Writes PNGs alongside the SVG sources

Requires `rsvg-convert` — install with `brew install librsvg` on macOS.

## File naming convention

| File | Use |
|---|---|
| `<name>.svg` | Outline / inactive variant |
| `<name>-filled.svg` | Filled / active variant |
| `<name>.png`, `<name>@2x.png`, `<name>@3x.png` | Auto-generated inactive PNGs |
| `<name>-filled.png`, `<name>-filled@2x.png`, `<name>-filled@3x.png` | Auto-generated active PNGs |

`<name>` should match the route name (or be intuitive — the wiring in `_layout.tsx` is explicit so any name works).

## How to wire icons in app/(tabs)/_layout.tsx

```tsx
<NativeTabs.Trigger name="index">
  <Icon src={{
    default:  require('@/assets/icons/tabs/home.png'),
    selected: require('@/assets/icons/tabs/home-filled.png'),
  }} />
  <Label>Home</Label>
</NativeTabs.Trigger>
```

Never combine `src` with `sf` or `drawable` on the same Icon — the type union forbids it.

## Source recommendations

Pick a single icon set and stay consistent across all 5 tabs:

- **Phosphor** — Regular weight = outline, Fill weight = filled. Designed as siblings. https://phosphoricons.com
- **Heroicons** — Outline and Solid explicit pairs. https://heroicons.com
- **Tabler** — Outline + Filled. https://tabler.io/icons
- **Iconoir** — Regular + Solid. https://iconoir.com

Download as SVG at 24px source size (the script handles density scaling). Make sure stroke/fill is set to `currentColor` (Heroicons, Phosphor) or a single solid color the script can sed-replace.

## Troubleshooting tint not applying

If active tab is not picking up `tintColor` (brand green) after a conversion:

1. **Restart Metro with cache reset:** `pnpm start --reset-cache`. The bundler caches asset hashes; new PNGs sometimes need a fresh bundle.
2. **Confirm PNGs were generated:** `ls assets/icons/tabs/*.png` should show 6 files per icon (3 densities × 2 states).
3. **Verify the layout uses `src`, not `sf`:** when `sf` is present, iOS uses the SF Symbol and ignores `src`. Comment out `sf` props before relying on PNGs.
4. **Confirm `tintColor` and `iconColor` are passed to `<NativeTabs>`:** active and inactive tinting requires both. Read them from `useTheme()` — never hardcode.
5. **Native rebuild:** if NativeTabs itself was updated or you switched from `sf` to `src` for the first time, native module changes may require `pnpm ios:rebuild` once.

## Common pitfall

Do not import SVG files directly as `src={<HomeIcon />}` even though it type-checks. NativeTabs accepts `React.ReactElement` as a source, but those elements are rendered as their literal pixels — `tintColor` does nothing. Always use the converted PNGs for tab bar icons. SVGs as React components are fine for in-screen icons (category icons, row icons, FAB icons), where you control color via props directly.
