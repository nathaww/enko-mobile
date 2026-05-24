#!/usr/bin/env bash
#
# Convert every SVG in assets/icons/tabs/ into PNGs at @1x / @2x / @3x densities,
# so they can be used as native tab bar icons by expo-router NativeTabs.
#
# Why PNG and not SVG: NativeTabs on iOS maps `src` to a `templateSource`,
# which UIKit renders with `UIImageRenderingModeAlwaysTemplate`. That uses
# only the alpha channel of the image and applies the tab's `tintColor`
# (active) or `iconColor` (inactive). SVG components passed as React elements
# do NOT get this treatment — they render with whatever color is baked in.
#
# Requirements: rsvg-convert (install with `brew install librsvg`).
#
# Source convention: download icons from Phosphor / Heroicons / Lucide etc.
# with `stroke="currentColor"` or `fill="currentColor"`. This script swaps
# currentColor with #000000 (any solid color works — template tinting only
# uses the alpha channel, so the source color is throwaway) and rasterizes.
#
# Naming: pair outline + filled icons as `<name>.svg` and `<name>-filled.svg`.
# The matching pair is wired up in app/(tabs)/_layout.tsx via:
#
#   src={{
#     default:  require('@/assets/icons/tabs/home.png'),
#     selected: require('@/assets/icons/tabs/home-filled.png'),
#   }}
#
# Run with: pnpm icons:convert

set -euo pipefail

ICONS_DIR="assets/icons/tabs"
TMP_DIR="$(mktemp -d)"

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "rsvg-convert not found. Install with: brew install librsvg"
  exit 1
fi

if [ ! -d "$ICONS_DIR" ]; then
  echo "$ICONS_DIR not found. Are you running this from the project root?"
  exit 1
fi

shopt -s nullglob
svgs=("$ICONS_DIR"/*.svg)

if [ ${#svgs[@]} -eq 0 ]; then
  echo "No SVGs found in $ICONS_DIR. Drop some in and re-run."
  exit 0
fi

echo "Converting ${#svgs[@]} SVGs to PNG @1x / @2x / @3x..."

for svg in "${svgs[@]}"; do
  base="$(basename "$svg" .svg)"
  # Replace currentColor with black so rsvg-convert has a concrete color to
  # render. iOS template tinting uses only the alpha channel; the visible
  # color is replaced at render time by tintColor / iconColor.
  sed 's/currentColor/#000000/g' "$svg" > "$TMP_DIR/$base.svg"

  rsvg-convert -w 24 -h 24 "$TMP_DIR/$base.svg" -o "$ICONS_DIR/$base.png"
  rsvg-convert -w 48 -h 48 "$TMP_DIR/$base.svg" -o "$ICONS_DIR/$base@2x.png"
  rsvg-convert -w 72 -h 72 "$TMP_DIR/$base.svg" -o "$ICONS_DIR/$base@3x.png"

  echo "  $base.svg -> $base.png + @2x + @3x"
done

rm -rf "$TMP_DIR"
echo "Done. $(ls "$ICONS_DIR"/*.png | wc -l | tr -d ' ') PNG files in $ICONS_DIR."
