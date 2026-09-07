frameboard

Image coordinates and revision-scoped annotations.

On Checkout, Draft 2, zoom to 50 percent and pin a recognizable spot. Resize the
window, change zoom, scroll and reload. Repeat on the portrait screenshot.
Stored coordinates are fractions of the actual image width and height.

Comments belong to one revision. Drafts belong to the selected view: switching
image or revision discards them, zooming preserves them. Save keeps the identity
of the revision on which it was pressed.

Resolve, Show resolved and Reopen are additional state transitions to explore. These operations
persist without changing comment text or location. Addressing a comment through
the wrong image or revision returns 404.

Run with Node 24+: npm ci, then npm run dev. Default web port 5173, API 3001.
Use npm run typecheck, npm test and npm run build to check the source.
