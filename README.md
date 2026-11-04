# CIIINDION website (static, GitHub Pages)
## Configure (all in `js/config.js`)
- `APPS_SCRIPT_URL`: Web App URL (see `google-apps-script/README.md`)
- `MAP_QUERY` / `ADDRESS_LINE` / `MAP_URL`: exact office address once known
- `PRODUCTS`: replace placeholders. Add images to `assets/images/website-images/`
- Logo: replace `assets/images/logo.png` (and `favicon.png`). Same filename, any PNG; height is fixed at 40px in the header.
- Placeholders still to fill in `index.html`: Vision, company background (marked `[ADD: ...]`).
## Deploy on GitHub Pages
1. github.com > New repository (e.g. `ciiindion-website`), Public.
2. Upload all files (Add file > Upload files) with `index.html` at the repo root, or `git init && git add . && git commit -m "Initial" && git remote add origin <url> && git push -u origin main`.
3. Settings > Pages > Source: **Deploy from a branch**, Branch: `main`, Folder: `/ (root)`, Save.
4. After ~1 minute: `https://<username>.github.io/ciiindion-website/`. All paths are relative, so the sub-path works.
5. Custom domain later: Settings > Pages > Custom domain, add a CNAME DNS record pointing to `<username>.github.io`, tick Enforce HTTPS.
## Test checklist
- [ ] Every nav link scrolls to its section; active item highlights; header stays visible
- [ ] Hamburger works at phone width; map stacks above form
- [ ] Empty/invalid name, email, phone, message each show a message
- [ ] Valid submit: spinner, button disabled, success message, new row in Sheet (Status "Received")
- [ ] Double-click Send creates only one row; resubmitting same email within 30 s fails
- [ ] Wrong Apps Script URL / offline shows the failure message
- [ ] Map loads; Get Directions opens Google Maps; logo and favicon show; no 404s in DevTools
