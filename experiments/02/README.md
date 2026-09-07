fieldnotes

Imports, source identity and citations.

Import Atlas and Beacon in either order. Atlas has four documents across three
pages; Beacon has three across two. Follow cursors until null, even when a page
is empty. Reimporting should update without duplicating or overwriting another
source. Restart the API and inspect the same data.

Search, reorder the document list and open the numbered citations. A citation
identifies a document, not its current array index.

Copy answer should produce: Markdown containing the displayed query,
answer and cited sources in citation order, with original URLs and source
names. Clipboard failure should leave the answer intact and allow another try.

Run with Node 24+: npm ci, then npm run dev. Default web port 5173, API 3001.
Use npm run typecheck, npm test and npm run build to check the source.
