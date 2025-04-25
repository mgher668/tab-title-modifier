#!/bin/bash

# Placeholder SVG content - a simple "T" character in a circle
SVG_CONTENT='<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <circle cx="64" cy="64" r="60" fill="#4f46e5" />
  <text x="64" y="85" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="white">T</text>
</svg>'

# Create the SVG file
echo "$SVG_CONTENT" > icon.svg

# Check if ImageMagick is installed
if command -v convert >/dev/null 2>&1; then
  # Generate the PNG icons in different sizes
  convert -background none icon.svg -resize 16x16 icon16.png
  convert -background none icon.svg -resize 48x48 icon48.png
  convert -background none icon.svg -resize 128x128 icon128.png
  
  echo "Icons generated successfully!"
else
  echo "ImageMagick is not installed. Please install it to generate icons."
  echo "Alternatively, use the SVG file (icon.svg) to create PNG files manually."
fi 