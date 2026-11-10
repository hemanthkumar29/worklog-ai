#!/usr/bin/env bash
set -euo pipefail

# WorkLog AI - High Fidelity macOS DMG Installer Generator
# Creates a retina-grade branded DMG with custom background, Applications symlink,
# and AppleScript Finder layout configuration.

APP_NAME="WorkLog AI"
VERSION="1.0.1"
ARCH="arm64"
DMG_NAME="WorkLog_AI_${VERSION}_macOS_${ARCH}.dmg"
STAGING_DIR="target/dmg_staging"
DIST_DIR="dist-packages"
APP_SOURCE="apps/desktop/src-tauri/target/release/bundle/macos/${APP_NAME}.app"

if [ ! -d "${APP_SOURCE}" ]; then
  # Fallback to local /Applications if freshly compiled
  if [ -d "/Applications/${APP_NAME}.app" ]; then
    APP_SOURCE="/Applications/${APP_NAME}.app"
  else
    echo "Error: ${APP_SOURCE} not found. Run 'tauri build' first." >&2
    exit 1
  fi
fi

echo "=== Preparing DMG Staging Directory ==="
rm -rf "${STAGING_DIR}"
mkdir -p "${STAGING_DIR}/.background"
mkdir -p "${DIST_DIR}"

# 1. Generate Retina background images
python3 scripts/generate_dmg_background.py

# 2. Copy App and create Applications symlink
echo "Copying ${APP_NAME}.app..."
cp -R "${APP_SOURCE}" "${STAGING_DIR}/${APP_NAME}.app"
ln -s /Applications "${STAGING_DIR}/Applications"

# Sign and seal the staged application bundle
echo "Sealing and signing ${APP_NAME}.app bundle with ad-hoc signature..."
codesign --force --deep --sign - "${STAGING_DIR}/${APP_NAME}.app"
codesign -vvv --deep --strict "${STAGING_DIR}/${APP_NAME}.app"

# 3. Create Gatekeeper Authorization Helper Script
cat << 'EOF' > "${STAGING_DIR}/Authorize_App.command"
#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "=========================================================="
echo "         WorkLog AI - macOS Gatekeeper Authorizer         "
echo "=========================================================="
echo ""
echo "Authorizing WorkLog AI for local execution..."

if [ -d "/Applications/WorkLog AI.app" ]; then
  xattr -rd com.apple.quarantine "/Applications/WorkLog AI.app" 2>/dev/null || true
  xattr -cr "/Applications/WorkLog AI.app" 2>/dev/null || true
  codesign --force --deep --sign - "/Applications/WorkLog AI.app" 2>/dev/null || true
  echo "Successfully authorized /Applications/WorkLog AI.app!"
elif [ -d "${DIR}/WorkLog AI.app" ]; then
  xattr -rd com.apple.quarantine "${DIR}/WorkLog AI.app" 2>/dev/null || true
  xattr -cr "${DIR}/WorkLog AI.app" 2>/dev/null || true
  codesign --force --deep --sign - "${DIR}/WorkLog AI.app" 2>/dev/null || true
  echo "Successfully authorized WorkLog AI.app in current directory!"
fi

echo ""
echo "You can now open WorkLog AI from your Applications folder or Spotlight."
echo "Press [Enter] to exit..."
read -r
EOF
chmod +x "${STAGING_DIR}/Authorize_App.command"

# 4. Copy background image
cp apps/desktop/src-tauri/dmg/background.png "${STAGING_DIR}/.background/background.png"
if [ -f "apps/desktop/src-tauri/dmg/background.tiff" ]; then
  cp apps/desktop/src-tauri/dmg/background.tiff "${STAGING_DIR}/.background/background.tiff"
fi

# 5. Create temporary read/write disk image
TEMP_DMG="target/temp_${DMG_NAME}"
rm -f "${TEMP_DMG}" "${DIST_DIR}/${DMG_NAME}"

echo "Creating temporary read-write disk image..."
hdiutil create -srcfolder "${STAGING_DIR}" -volname "${APP_NAME}" -fs HFS+ \
  -fsargs "-c c=64,a=16,e=16" -format UDRW -size 120m "${TEMP_DMG}"

# 6. Mount temporary disk image
echo "Mounting disk image for Finder layout configuration..."
MOUNT_DIR=$(mktemp -d -t dmg-mount-XXXXXX)
hdiutil attach "${TEMP_DMG}" -noautoopen -mountpoint "${MOUNT_DIR}"

# 7. Configure Finder aesthetics via AppleScript
echo "Applying AppleScript window and icon layout..."
osascript << APPLESCRIPT || true
tell application "Finder"
  tell disk "${APP_NAME}"
    open
    set current view of container window to icon view
    set toolbar visible of container window to false
    set statusbar visible of container window to false
    set the bounds of container window to {400, 150, 1060, 550}
    set viewOptions to the icon view options of container window
    set arrangement of viewOptions to not arranged
    set icon size of viewOptions to 105
    try
      set background picture of viewOptions to file ".background:background.png"
    end try
    set position of item "${APP_NAME}.app" of container window to {180, 185}
    set position of item "Applications" of container window to {480, 185}
    set position of item "Authorize_App.command" of container window to {330, 310}
    close
    open
    update without registering applications
    delay 1
    close
  end tell
end tell
APPLESCRIPT

# Sync and unmount
sync
hdiutil detach "${MOUNT_DIR}" -force || true
rm -rf "${MOUNT_DIR}"

# 8. Convert to compressed read-only DMG (UDZO)
echo "Converting to compressed distribution DMG (UDZO)..."
hdiutil convert "${TEMP_DMG}" -format UDZO -imagekey zlib-level=9 -o "${DIST_DIR}/${DMG_NAME}"
rm -f "${TEMP_DMG}"

# 9. Verify generated DMG
echo "=== Verification ==="
ls -lh "${DIST_DIR}/${DMG_NAME}"
hdiutil imageinfo "${DIST_DIR}/${DMG_NAME}" | grep -E "Format|Checksum|Total Non-Empty Bytes" || true

echo "=== Successfully built ${DIST_DIR}/${DMG_NAME} ==="

