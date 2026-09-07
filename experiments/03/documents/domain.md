# Review data and coordinate contract

A **frame** is a named screenshot subject, such as Checkout. A **revision** is one
immutable screenshot of that subject. Its image URL, intrinsic width, and intrinsic
height are stored together. A frame's current revision is the default selection,
not a replacement for its historical revisions.

An **annotation** belongs to one frame and one revision. The IDs identify ownership;
the display label (for example, Draft 1) is only presentation. Annotation IDs are
opaque strings. Timestamps order comments but do not determine their ownership.

## Locations

`x` and `y` are normalized image coordinates. `(0, 0)` is the upper-left image
corner, `(1, 1)` is the lower-right corner, and `(0.5, 0.5)` is its center. The API
accepts the closed interval on both axes. It rejects non-numbers, out-of-range
coordinates, and empty or overlong comments. The image is displayed without
rotation or cropping, preserving its aspect ratio. The canvas may shrink to fit
available space even when the Zoom control requests a larger size.

Examples for a 1200 × 800 source screenshot:

| Source point | Stored point | At a displayed size of 600 × 400 |
| --- | --- | --- |
| (600, 400) | (0.5, 0.5) | (300, 200) from the displayed image's upper-left |
| (900, 200) | (0.75, 0.25) | (450, 100) from the displayed image's upper-left |

A stored location represents image content rather than a browser window position.
Do not change stored coordinates simply because a user adjusts Zoom or viewport.
The application uses browser client coordinates for pointer events. Canvas padding,
page scroll, and the image's position in the viewport are presentation concerns.

## Review states

A draft is unsaved UI state. Changing screenshot or revision discards it; changing
Zoom does not. Cancel discards it. Save records the comment on the selected revision.
A layout suggestion is also unsaved until its draft is explicitly saved.

A saved annotation has `resolved: false` initially. Resolution changes only that
flag; original content, ownership, location, and creation time stay intact. A normal
review view shows open annotations. Show resolved includes both states. All states
remain available through the detail API, allowing each view to choose its filter.

## Local storage

SQLite uses WAL mode and foreign keys. The first launch seeds the database only
when it is empty. `npm run seed` intentionally replaces the current database with
fixtures. There is no migration service or remote database. The server's public
`createApp(store)` factory accepts a separate store for isolated tests.
