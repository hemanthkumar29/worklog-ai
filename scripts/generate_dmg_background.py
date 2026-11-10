#!/usr/bin/env python3
"""
WorkLog AI - Retina-grade macOS DMG Background Generator
Generates high-resolution 1x (660x400) and 2x (1320x800) branded background images
for macOS Disk Image (DMG) installer with Apple HIG aesthetics.
"""

import os
import sys
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_dmg_background(scale=2):
    # Base dimensions (points)
    w_pt, h_pt = 660, 400
    width = w_pt * scale
    height = h_pt * scale

    # Load fonts
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 26 * scale)
        font_subtitle = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 13 * scale)
        font_badge = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 11 * scale)
        font_arrow = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 12 * scale)
        font_footer = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 11 * scale)
        font_footer_sub = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 9 * scale)
    except Exception:
        font_title = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 26 * scale)
        font_subtitle = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 13 * scale)
        font_badge = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 11 * scale)
        font_arrow = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 12 * scale)
        font_footer = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 11 * scale)
        font_footer_sub = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 9 * scale)

    # Base image with deep Apple Dark Mode slate gradient
    # From (12, 17, 29) to (20, 29, 47) to (14, 20, 34)
    img = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    for y in range(height):
        t = y / float(height)
        # Subtle non-linear gradient
        r = int(11 + 10 * math.sin(t * math.pi))
        g = int(16 + 13 * math.sin(t * math.pi))
        b = int(28 + 22 * math.sin(t * math.pi))
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    # Add subtle atmospheric radial glows behind the drop zones
    # Icon position: (180, 185) in pt, Apps position: (480, 185) in pt
    glow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)

    # Left glow (brand purple/indigo glow)
    app_center = (180 * scale, 185 * scale)
    glow_r = 130 * scale
    for gr in range(glow_r, 0, -4):
        alpha = int(28 * (1.0 - gr / glow_r) ** 1.8)
        glow_draw.ellipse(
            [app_center[0] - gr, app_center[1] - gr, app_center[0] + gr, app_center[1] + gr],
            fill=(99, 102, 241, alpha)
        )

    # Right glow (cyan/sky glow)
    apps_center = (480 * scale, 185 * scale)
    for gr in range(glow_r, 0, -4):
        alpha = int(28 * (1.0 - gr / glow_r) ** 1.8)
        glow_draw.ellipse(
            [apps_center[0] - gr, apps_center[1] - gr, apps_center[0] + gr, apps_center[1] + gr],
            fill=(14, 165, 233, alpha)
        )

    img = Image.alpha_composite(img, glow_layer)
    draw = ImageDraw.Draw(img)

    # Draw pedestals for the two icons
    # Left pedestal
    p_radius = 56 * scale
    pedestal_border_left = [
        app_center[0] - p_radius, app_center[1] - p_radius,
        app_center[0] + p_radius, app_center[1] + p_radius
    ]
    draw.ellipse(pedestal_border_left, fill=(255, 255, 255, 6), outline=(99, 102, 241, 60), width=1 * scale)

    # Right pedestal
    pedestal_border_right = [
        apps_center[0] - p_radius, apps_center[1] - p_radius,
        apps_center[0] + p_radius, apps_center[1] + p_radius
    ]
    draw.ellipse(pedestal_border_right, fill=(255, 255, 255, 6), outline=(14, 165, 233, 60), width=1 * scale)

    # Top Header: WorkLog AI branding
    # Logo title
    title_text = "WorkLog AI"
    title_bbox = draw.textbbox((0, 0), title_text, font=font_title)
    title_w = title_bbox[2] - title_bbox[0]
    title_x = (width - title_w) // 2
    title_y = int(32 * scale)

    # Subtle text shadow
    draw.text((title_x, title_y + 1 * scale), title_text, fill=(0, 0, 0, 160), font=font_title)
    draw.text((title_x, title_y), title_text, fill=(255, 255, 255, 245), font=font_title)

    # Subtitle tagline
    subtitle_text = "Describe your work. Let AI document it."
    sub_bbox = draw.textbbox((0, 0), subtitle_text, font=font_subtitle)
    sub_w = sub_bbox[2] - sub_bbox[0]
    sub_x = (width - sub_w) // 2
    sub_y = int(68 * scale)
    draw.text((sub_x, sub_y), subtitle_text, fill=(148, 163, 184, 210), font=font_subtitle)

    # Feature badges pill: Offline • SQLite • Excel Non-Destructive
    badge_text = "OFFLINE  •  SQLITE  •  EXCEL ATOMIC SYNC"
    b_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    b_w = b_bbox[2] - b_bbox[0]
    b_h = b_bbox[3] - b_bbox[1]
    b_x = (width - b_w) // 2
    b_y = int(92 * scale)

    pill_pad_x = 12 * scale
    pill_pad_y = 4 * scale
    pill_rect = [
        b_x - pill_pad_x, b_y - pill_pad_y,
        b_x + b_w + pill_pad_x, b_y + b_h + pill_pad_y
    ]
    draw.rounded_rectangle(pill_rect, radius=8 * scale, fill=(255, 255, 255, 10), outline=(255, 255, 255, 25), width=1 * scale)
    draw.text((b_x, b_y), badge_text, fill=(129, 140, 248, 230), font=font_badge)

    # Central Directional Arrow & Drag Instruction
    center_y = int(185 * scale)
    arrow_start_x = int(248 * scale)
    arrow_end_x = int(412 * scale)

    # Glowing arrow shaft
    draw.line([(arrow_start_x, center_y), (arrow_end_x, center_y)], fill=(129, 140, 248, 180), width=3 * scale)

    # Arrowhead
    head_len = 10 * scale
    head_h = 7 * scale
    arrow_pts = [
        (arrow_end_x, center_y),
        (arrow_end_x - head_len, center_y - head_h),
        (arrow_end_x - head_len + 2 * scale, center_y),
        (arrow_end_x - head_len, center_y + head_h),
    ]
    draw.polygon(arrow_pts, fill=(129, 140, 248, 240))

    # "Drag to install" label centered over the arrow
    drag_text = "Drag to install"
    drag_bbox = draw.textbbox((0, 0), drag_text, font=font_arrow)
    drag_w = drag_bbox[2] - drag_bbox[0]
    drag_x = (width - drag_w) // 2
    drag_y = center_y - int(24 * scale)

    # Label background capsule
    drag_pill_rect = [
        drag_x - 10 * scale, drag_y - 3 * scale,
        drag_x + drag_w + 10 * scale, drag_y + (drag_bbox[3] - drag_bbox[1]) + 4 * scale
    ]
    draw.rounded_rectangle(drag_pill_rect, radius=6 * scale, fill=(15, 23, 42, 220), outline=(99, 102, 241, 100), width=1 * scale)
    draw.text((drag_x, drag_y), drag_text, fill=(226, 232, 240, 240), font=font_arrow)

    # Bottom guidance / Security and Gatekeeper guidance
    footer_line_y = int(342 * scale)
    draw.line([(30 * scale, footer_line_y), (width - 30 * scale, footer_line_y)], fill=(255, 255, 255, 20), width=1 * scale)

    footer_1 = "First Launch: If blocked by macOS Gatekeeper, Right-Click > Open, or double-click Authorize_App.command"
    f1_bbox = draw.textbbox((0, 0), footer_1, font=font_footer)
    f1_w = f1_bbox[2] - f1_bbox[0]
    f1_x = (width - f1_w) // 2
    f1_y = int(354 * scale)
    draw.text((f1_x, f1_y), footer_1, fill=(203, 213, 225, 220), font=font_footer)

    footer_2 = "WorkLog AI Offline Edition • Zero network calls • Complete user privacy • Apple Silicon M-Series & Intel"
    f2_bbox = draw.textbbox((0, 0), footer_2, font=font_footer_sub)
    f2_w = f2_bbox[2] - f2_bbox[0]
    f2_x = (width - f2_w) // 2
    f2_y = int(374 * scale)
    draw.text((f2_x, f2_y), footer_2, fill=(100, 116, 139, 200), font=font_footer_sub)

    return img

def main():
    os.makedirs("apps/desktop/src-tauri/dmg", exist_ok=True)
    os.makedirs("target/dmg_staging/.background", exist_ok=True)

    print("Generating 1x DMG background (660x400)...")
    img_1x = create_dmg_background(scale=1)
    img_1x.save("apps/desktop/src-tauri/dmg/background.png", "PNG", optimize=True)
    img_1x.save("target/dmg_staging/.background/background.png", "PNG", optimize=True)

    print("Generating 2x Retina DMG background (1320x800)...")
    img_2x = create_dmg_background(scale=2)
    img_2x.save("apps/desktop/src-tauri/dmg/background@2x.png", "PNG", optimize=True)
    img_2x.save("target/dmg_staging/.background/background@2x.png", "PNG", optimize=True)

    # Create multi-resolution TIFF for Retina Mac displays
    os.system("tiffutil -cathidp apps/desktop/src-tauri/dmg/background.png apps/desktop/src-tauri/dmg/background@2x.png -out apps/desktop/src-tauri/dmg/background.tiff 2>/dev/null")
    os.system("cp apps/desktop/src-tauri/dmg/background.tiff target/dmg_staging/.background/background.tiff 2>/dev/null")

    print("Retina DMG backgrounds generated successfully:")
    print(" - apps/desktop/src-tauri/dmg/background.png")
    print(" - apps/desktop/src-tauri/dmg/background@2x.png")
    print(" - apps/desktop/src-tauri/dmg/background.tiff")

if __name__ == "__main__":
    main()

