# Google Apps Script setup
1. Create a Google Sheet (e.g. "CIIINDION Enquiries"). Copy its ID from the URL: `docs.google.com/spreadsheets/d/<SHEET_ID>/edit`.
2. In the sheet: Extensions > Apps Script. Replace the default code with `Code.gs`, set `SHEET_ID`. Save.
3. Deploy > New deployment > type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and authorise when prompted.
4. Copy the Web app URL (ends in `/exec`) into `APPS_SCRIPT_URL` in `js/config.js`.
5. Open the URL in a browser: you should see `{"status":"ok",...}`.
6. After ANY edit to Code.gs: Deploy > Manage deployments > Edit > Version: New version > Deploy (URL stays the same).
Sheet columns (auto-created on first submission): Timestamp, Name, Email, Contact Number, Message, Submission Status.
Spam protection: hidden honeypot, minimum fill time (3 s), 30 s per-email cooldown, server-side validation, formula-injection guard.
