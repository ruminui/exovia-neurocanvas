# Release metadata

This directory stores machine-readable records created after release assets are published and verified.

For `android-latest`:

- `android-latest.json` records the asset URL, checksum URL, byte size, source commit, workflow run and verification time;
- `Exovia-NeuroCanvas-Android.apk.sha256` contains the published APK SHA-256;
- the release workflow downloads the published APK and checksum again, byte-compares them with the build output and verifies SHA-256 before committing the record.

A `verified: true` value describes that automated release check. It is not a code-signing certificate, store review or guarantee that every Android device will permit sideloading.
