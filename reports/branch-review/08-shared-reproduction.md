# Shared platform browser reproductions

Parent verification on 2026-10-19 used pinned head `859fd7b0f1365f90cbef22b0975f612580580e2c`, its isolated archive/build, Chromium 1228 and disposable browser contexts. The temporary probe `/tmp/daily-review-shared-probe.mjs` started a separate local server on port 8779 and closed its browser/server in finally. Application source was unchanged. The completed probe exited 0.

## SH-1 P2: focused skip link is covered by the desktop sidebar

1. Open Home at 1280 × 740 with the desktop sidebar expanded.
2. Focus Skip to content through keyboard navigation or the equivalent locator focus used by the probe.
3. Inspect its bounding box, stacking order and the element painted at its center.

Observed: activeElement is the skip link; its rectangle is x=12, y=8, width=149.515625, height=47. `document.elementFromPoint` at its center returns `SPAN.sidebar-brand` inside the sidebar. Link z-index=5; sidebar z-index=50. The focused label and outline are behind the opaque sidebar. The skip action remains operable if activated blindly, but its focus is not visible.

Changed anchor: `apps/daily/src/shell/sidebar.css:3`. Raise the focused skip link above the new sidebar or move it clear of the sidebar's occupied region.

## SH-2 P2: recovery entered from the open drawer cannot scroll

1. At 320 × 500, open Plants and then Apps.
2. Simulate another tab corrupting the root: set `daily:v1` to `{broken` and dispatch the corresponding storage event. This uses disposable synthetic state, not user storage.
3. Wait for Local data needs attention, then attempt to scroll down using a mouse wheel by 1000px.

Observed before/after wheel: `.daily-shell.dataset.menuOpen` remains `true`; no sidebar remains; body overflow is `hidden`; document height=812 while viewport height=500; scrollY remains 0. The failure renderer replaced the navigation with recovery controls but retained the drawer-open attribute. There is no close control to release the scroll lock. Reset drawer state on entering recovery, or scope the body lock to an actual open drawer.

Changed anchor: `apps/daily/src/shell/sidebar.css:34`; dependency `render.js:failure()` retains the root element and its attributes.

## SH-3 P3: current sidebar links cancel modified-click defaults

1. At desktop width open Plants.
2. Perform a real Playwright Control-click on the current My plants sidebar anchor.
3. Compare with a temporary ordinary anchor targeting the identical URL, observing `defaultPrevented` in a document click listener after root event handling.

Observed events:

```json
[{"control":"current-sidebar-link","prevented":true},{"control":"reference-link","prevented":false}]
```

`sidebar-controls.js:63` unconditionally prevents the default for a same-hash link, without allowing Ctrl/Meta/other modified clicks through. Preserve native modified-link handling and perform same-route focus/scroll handling only for an ordinary activation. This evidence demonstrates actual event cancellation; it does not claim a measured popup count.

## Verification limits and setup errors

The initial sandboxed browser invocation failed because Chromium sockets were blocked (`Operation not permitted`); the approved outside-sandbox run succeeded. A follow-up popup-count probe timed out waiting for a reference popup, so popup creation was not established or used as evidence. It was replaced by direct real-click event instrumentation. The final complete probe reproduced all three observations above and exited 0. No setup failure is counted as a product bug.

The unmodified General suite passed all 85 unit and 37 browser cases, including the 360 route/width checks, offline/update and storage recovery cases. Existing tests omit the focused skip-link layer, recovery while the drawer is open and modified activation of the current link. Screen-reader and physical-device behavior were not separately tested.
