#!/usr/bin/env bash
# WorkLog AI - Automated macOS Installer
set -e

echo "=================================================="
echo "WorkLog AI - Automated macOS Installer"
echo "=================================================="

VERSION="1.0.1"
DMG_NAME="WorkLog_AI_${VERSION}_macOS_arm64.dmg"
DOWNLOAD_URL="https://github.com/hemanthkumar29/worklog-ai/releases/download/v${VERSION}/${DMG_NAME}"
TEMP_DIR=$(mktemp -d)
DMG_PATH="${TEMP_DIR}/${DMG_NAME}"

echo "1. Downloading WorkLog AI v${VERSION}..."
curl -fsSL -o "${DMG_PATH}" "${DOWNLOAD_URL}"

echo "2. Mounting disk image..."
MOUNT_DIR=$(hdiutil attach -nobrowse -readonly "${DMG_PATH}" | grep "/Volumes" | awk -F'\t' '{print $NF}' | tr -d '\n')

if [ -z "${MOUNT_DIR}" ] || [ ! -d "${MOUNT_DIR}" ]; then
  echo "Error: Failed to mount disk image."
  rm -rf "${TEMP_DIR}"
  exit 1
fi

echo "3. Installing to /Applications/WorkLog AI.app..."
rm -rf "/Applications/WorkLog AI.app"
cp -R "${MOUNT_DIR}/WorkLog AI.app" "/Applications/"

echo "4. Unmounting disk image..."
hdiutil detach "${MOUNT_DIR}" -quiet || true
rm -rf "${TEMP_DIR}"

echo "5. Applying security authorization (removing quarantine attribute)..."
xattr -cr "/Applications/WorkLog AI.app"

echo "=================================================="
echo "Installation successful."
echo "WorkLog AI is now available in your Applications folder."
echo "=================================================="
