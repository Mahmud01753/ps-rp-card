# Political Science Forum — Editable HTML Card

## Root files
- `index.html`
- `style.css`
- `script.js`
- `logo-left.png`
- `logo-right.png`
- `portrait.png`
- `README.md`

## Defaults
- LEFT logo: supplied Logo 4
- RIGHT logo: supplied Logo 1
- Portrait: supplied Portrait 3 with a green background
- Poster artwork: supplied Card Design 2
- `POLITICAL SCIENCE FORUM` remains fixed and non-editable.

## Editing
Open `index.html` in a browser. Edit the text fields, upload a new portrait, or upload replacement logos.

Portrait controls:
- Zoom In / Zoom Out
- Move Left / Right / Up / Down
- Reset

Text is forced to one line and automatically reduced only as needed to remain inside its assigned area.

## PNG export
`DOWNLOAD PNG` renders only the poster into a 1024×1536 PNG canvas, creates a PNG Blob with `canvas.toBlob()`, and triggers a temporary `<a download>` element. Editor controls are never included in the exported PNG.

If a browser blocks the first download, the fallback `OPEN PNG / SAVE PNG` button becomes available.

## GitHub Pages
Upload all seven root files to the same repository/root level. No `assets/`, `css/`, or `js/` folders are required.
