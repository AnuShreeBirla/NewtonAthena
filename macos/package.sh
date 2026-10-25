#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
npm run build

APP="release/Newton Athena.app"
DMG="release/Newton Athena-0.0.0-arm64.dmg"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/web"
cp -R dist/. "$APP/Contents/Resources/web/"
swiftc macos/NewtonAthena.swift -o "$APP/Contents/MacOS/NewtonAthena" -framework AppKit -framework WebKit
cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>NewtonAthena</string>
<key>CFBundleIdentifier</key><string>com.newtonathena.desktop</string>
<key>CFBundleName</key><string>Newton Athena</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>1.0</string>
<key>LSMinimumSystemVersion</key><string>12.0</string>
<key>NSCameraUsageDescription</key><string>Newton Athena uses your camera for the exam preview and periodic local test photos.</string>
</dict></plist>
PLIST
xattr -cr "$APP"
xattr -d com.apple.FinderInfo "$APP" 2>/dev/null || true
codesign --force --deep --sign - "$APP"
mkdir -p release
rm -f "$DMG"
hdiutil create -volname "Newton Athena" -srcfolder "$APP" -format UDZO -ov "$DMG"
echo "Created $DMG"
