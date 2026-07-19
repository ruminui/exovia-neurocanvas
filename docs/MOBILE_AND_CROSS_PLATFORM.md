# Mobile and Cross-Platform Operation

Status: IMPLEMENTED / PHYSICAL-DEVICE VALIDATION PENDING

## Supported targets

The application is designed as an installable Progressive Web App for:

- Android phones and tablets
- iPhone and iPad through Safari
- Windows 10/11
- macOS
- Linux
- Chromium, Firefox and Safari-class modern browsers

No native wrapper is required for the current release. The same local-first project format is used across platforms.

## Mobile interaction model

- One-finger drag: pan the canvas.
- Pinch: zoom around the gesture midpoint.
- Tap a node: inspect evidence.
- Double tap: fit the map.
- Explore: open search, modes, statistics and audit trail.
- Evidence: open the selected-node inspector.
- Actions: open project creation, file import, Exil, export and installation commands.
- Answer: open search and focus the query field.

The interface accounts for:

- safe-area insets on notched devices;
- dynamic mobile browser viewport height;
- portrait and landscape layouts;
- coarse-pointer target sizes;
- on-screen keyboard resizing;
- standalone PWA display mode.

## Installation

### Android / Chrome

1. Serve the repository through HTTPS or a local network HTTP server.
2. Open the application in Chrome.
3. Choose **Install app** or **Add to Home screen**.
4. Open NeuroCanvas from the installed icon.

### iPhone / iPad / Safari

1. Open the HTTPS deployment in Safari.
2. Tap Share.
3. Choose **Add to Home Screen**.
4. Launch NeuroCanvas from the home screen.

### Desktop

Use the browser install control when available, or run directly in a modern browser.

## Local-network phone testing

From the repository directory on the computer:

```bash
python -m http.server 8080 --bind 0.0.0.0
```

Find the computer's local network IP and open this address on a phone connected to the same network:

```text
http://COMPUTER_IP:8080
```

Browser installation and service-worker behavior may require HTTPS depending on browser policy. Ordinary functional testing can still be performed over the local network.

## Required device QA

### Android portrait

- [ ] Application loads without horizontal overflow.
- [ ] Bottom navigation remains visible.
- [ ] One-finger pan works.
- [ ] Pinch zoom works.
- [ ] Tap selection opens evidence.
- [ ] Text import works with the software keyboard.
- [ ] Project saves and restores after reload.
- [ ] File import can use the Android file picker.
- [ ] Export downloads a project JSON.

### Android landscape

- [ ] Canvas remains usable.
- [ ] Navigation does not cover essential controls.
- [ ] Side panels fit the reduced height.

### iPhone / Safari

- [ ] Safe areas are respected.
- [ ] Address-bar expansion does not break the layout.
- [ ] Add to Home Screen launches in standalone mode.
- [ ] IndexedDB persists the active project.
- [ ] Pinch and tap interactions do not trigger unwanted page scrolling.

### Tablet

- [ ] Panels, dialogs and canvas use available space appropriately.
- [ ] Touch targets remain at least approximately 44 CSS pixels.
- [ ] Rotation preserves a usable project state.

## Honest limitation

The mobile layout and touch adapter are implemented in the repository. Physical Android and iOS device execution has not yet been verified from this environment. Do not mark the mobile target VERIFIED until the checklist above has runtime evidence.
