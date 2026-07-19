# Audit Execution Order

This file converts the master audit into a strict work queue.

## Wave 1 — reproducibility

1. Generate `package-lock.json` with Node 20 in a trusted environment.
2. Replace clean-install instructions with `npm ci` where the lockfile is used.
3. Execute root and backend verification.
4. Preserve readiness and Playwright artifacts.

Exit gate: clean install and all automated suites pass.

## Wave 2 — project lifecycle

1. Add and execute tests for node create, edit and delete.
2. Verify autosave.
3. Verify snapshot creation and restoration.
4. Verify project duplication isolation.
5. Verify project deletion cleanup.
6. Verify export and fresh import round trip.

Exit gate: all lifecycle operations persist and audit correctly.

## Wave 3 — import matrix

1. TXT.
2. Markdown.
3. Valid NeuroCanvas JSON.
4. Malformed and incompatible JSON.
5. ExiaL.
6. Log files.
7. Unicode and Spanish text.
8. Large text fixture.

Exit gate: supported formats pass and unsupported input fails safely.

## Wave 4 — offline and deployment

1. Verify initial service-worker install.
2. Verify offline reload.
3. Verify cache upgrade.
4. Enable GitHub Pages.
5. Verify repository subpath handling.
6. Test public URL on desktop and mobile.

Exit gate: latest release works offline and from the public URL.

## Wave 5 — usability and accessibility

1. Keyboard-only journey.
2. Dialog focus and restoration.
3. Visible focus states.
4. Mobile touch and overflow.
5. Screen-reader naming.
6. Reduced-motion behavior.
7. New-user comprehension test.

Exit gate: a guest completes the core flow without developer assistance.

## Wave 6 — submission evidence

1. Run external System Check.
2. Time Guided Judge Mode.
3. Produce final screenshots.
4. Record and publish the video.
5. Complete substantial Codex work and capture authentic feedback ID.
6. Align README, status, matrix, Devpost copy and narration.
7. Complete team and legal submission actions.

Exit gate: no P0 item remains without evidence.

## Rule

Do not start a lower wave to avoid an unresolved failure in a higher wave. Document genuine external blockers and continue only with independent work.