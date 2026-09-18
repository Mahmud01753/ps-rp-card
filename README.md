# Political Science Forum — Editable Card

GitHub Pages-ready static editor.

## Root files
- `index.html`
- `style.css`
- `script.js`
- `logo-left.png`
- `logo-right.png`
- `portrait.png`
- `README.md`

The Design 2 card artwork is embedded directly in `style.css`, so no assets/css/js folders are required.

## Fixed artwork
`POLITICAL SCIENCE FORUM` remains part of the fixed Design 2 artwork and has no editor field.

## Editable
- M.C COLLEGE, SYLHET
- COMMITTEE 2026-27
- MAHMUDUL HASAN
- MEMBER
- MASTER'S FINAL (47TH BATCH)
- DEPARTMENT OF POLITICAL SCIENCE

Text is kept on one line and automatically reduced slightly when necessary so it stays inside its designated area.

## Photo
Upload, zoom, move, or reset. The portrait is clipped to the fixed photo area and a new upload fully replaces the old one.

## Logos
Left and right logos can be replaced. Aspect ratio is preserved. The supplied left logo has an edge-connected white background removed so it does not appear as a white floating rectangle; enclosed white logo details are retained.

## PNG download
The editor renders the final 1024×1536 poster to a canvas, creates a PNG Blob with `canvas.toBlob()`, creates a temporary object URL, and triggers an `<a download>` click. Editor controls are not exported.
