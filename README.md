# Newton Athena

Newton Athena is a small macOS and React test workspace with a webcam preview, a 14-minute preparation countdown, full-screen test mode, and periodic local photo capture. It uses the macOS WebKit runtime instead of bundling Electron.

## Requirements

- Node.js and npm
- A webcam for camera and photo features

## Run locally

```bash
npm install
npm start
```

`npm start` launches the Vite development server for browser-based UI work.

## Build

```bash
npm run build
npm run package
```

The package command builds a macOS app and disk image in `release/`. Open the `.dmg` and drag Newton Athena to Applications. The package is built for Apple Silicon Macs.

## Photo storage

Photos are captured every 10 seconds during an active test and saved locally in the user's Application Support folder under `Newton Athena/photos/`.

Camera frames and saved photos stay on the local machine. The app asks before entering full-screen mode and before quitting a test.
