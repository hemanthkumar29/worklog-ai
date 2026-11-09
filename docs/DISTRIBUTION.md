# WorkLog AI — Packaging, Build Pipeline & Distribution Guide

This document defines the production packaging, release build pipeline, platform support, and offline verification procedures for **WorkLog AI**.

---

## 1. Distribution Artifacts

| Platform | Target Architecture | Distribution Package | Installer Type | Bundle Path / Output |
|---|---|---|---|---|
| **macOS** | Apple Silicon (`aarch64-apple-darwin`) | `WorkLog AI_1.0.0_aarch64.dmg` | Disk Image (.dmg) & .app bundle | `src-tauri/target/release/bundle/dmg/` |
| **macOS** | Intel (`x86_64-apple-darwin`) | `WorkLog AI_1.0.0_x64.dmg` | Disk Image (.dmg) & .app bundle | `src-tauri/target/release/bundle/dmg/` |
| **Windows** | Windows 10/11 x64 (`x86_64-pc-windows-msvc`) | `WorkLog_AI_1.0.0_x64-setup.exe` | NSIS Executable Installer | `src-tauri/target/release/bundle/nsis/` |
| **Windows** | Windows 10/11 x64 (`x86_64-pc-windows-msvc`) | `WorkLog_AI_1.0.0_x64.msi` | Windows Installer (WiX / MSI) | `src-tauri/target/release/bundle/msi/` |

---

## 2. Release Build Commands

### 2.1 macOS Native Release Build

```bash
# Ensure Rust and Node tools are in PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Build production frontend and compile native macOS bundle
cd apps/desktop
npm run build
npm run tauri build
```

The output will be placed in:
`apps/desktop/src-tauri/target/release/bundle/dmg/WorkLog AI_1.0.0_aarch64.dmg`

### 2.2 Windows Release Build (from Windows CI or Runner)

```powershell
cd apps\desktop
npm run build
npm run tauri build
```

The output will be placed in:
`apps/desktop/src-tauri/target/release/bundle/nsis/WorkLog_AI_1.0.0_x64-setup.exe`

---

## 3. Automated CI/CD Release Workflow (GitHub Actions)

A fully automated release workflow is configured in `.github/workflows/release.yml`:

```yaml
name: Release WorkLog AI Desktop

on:
  push:
    tags:
      - 'v*'

jobs:
  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: aarch64-apple-darwin, x86_64-apple-darwin
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install Frontend Dependencies
        run: cd apps/desktop && npm ci
      - name: Build macOS DMG
        run: cd apps/desktop && npm run tauri build
      - name: Upload macOS DMG
        uses: actions/upload-artifact@v4
        with:
          name: macos-dmg
          path: apps/desktop/src-tauri/target/release/bundle/dmg/*.dmg

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: x86_64-pc-windows-msvc
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install Frontend Dependencies
        run: cd apps/desktop && npm ci
      - name: Build Windows Installer
        run: cd apps/desktop && npm run tauri build
      - name: Upload Windows Setup
        uses: actions/upload-artifact@v4
        with:
          name: windows-setup
          path: apps/desktop/src-tauri/target/release/bundle/nsis/*.exe
```

---

## 4. Code Signing & macOS Notarization Requirements

For distribution to external users outside development machines:
1. **macOS Gatekeeper & Notarization:**
   - Apple Developer ID Application Certificate: `Developer ID Application: <Name> (<Team ID>)`
   - Hardened Runtime enabled via Tauri (`entitlements.plist`).
   - Notarization executed via `xcrun notarytool submit` or Tauri's automated notarization hook.
2. **Windows SmartScreen:**
   - Standard or EV Code Signing Certificate (`.pfx`).
   - Sign tool command: `signtool.exe sign /f cert.pfx /p <password> /tr http://timestamp.digicert.com /td sha256 /fd sha256 <binary>`.

---

## 5. Offline Functionality Verification Protocol

Before certifying any build for release, the following offline verification test must be conducted:

1. **Hardware Disconnection:**
   - Disconnect Ethernet and turn off Wi-Fi on the test machine (`sudo ifconfig en0 down` or physical disconnect).
2. **First Launch & Setup:**
   - Open installed `WorkLog AI`.
   - Confirm SQLite database is created in `~/Library/Application Support/com.worklog.ai/` or `%APPDATA%\com.worklog.ai\`.
   - Complete 3-step onboarding.
3. **Capture & AI Processing:**
   - Enter: *"Researched Salesforce duplicate prevention and configured matching rules."*
   - Click "Enhance with Local AI".
   - Confirm structured output displays with Title, Tasks, Technologies, Category, and Status without making any network requests.
4. **Excel Append:**
   - Map columns to a local `.xlsx` workbook.
   - Click "Approve & Sync to Excel".
   - Confirm backup file is created in `backups/`.
   - Open Excel workbook and confirm row was cleanly appended.
5. **Application Lifecycle Test:**
   - Quit WorkLog AI (`Cmd + Q` / `Alt + F4`).
   - Reopen application while still disconnected from the internet.
   - Confirm activity history, projects, and templates are fully intact.
