# Newton Athena

Newton Athena is an Electron and React test workspace with a webcam preview, a 14-minute preparation countdown, full-screen test mode, and periodic local photo capture.

## Requirements

- Node.js and npm
- A webcam for camera and photo features

## Run locally

```bash
npm install
npm start
```

`npm start` launches the Vite development server and the Electron window. Allow camera access when prompted.

## Build

```bash
npm run build
npm run package
```

The package command creates a macOS disk image in `release/`.

## Photo storage

Photos are captured every 10 seconds during an active test. In development, they are saved in the project `photos/` folder. Packaged builds store them in Electron's application data directory under `photos/`.

Camera frames and saved photos stay on the local machine. The app asks before entering full-screen mode and before quitting a test.
