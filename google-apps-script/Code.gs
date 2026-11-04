/** CIIINDION contact form -> Google Sheet. Paste into script.google.com (see README.md). */
var SHEET_ID  = '1283LqpVRiUEvWFB0fAULFdzhEOD6fmJMbevmexTV5xM'
var SHEET_TAB = 'Enquiries';
var MIN_FILL_MS = 3000;   // submitted faster than this = bot
var COOLDOWN_SEC = 30;    // same email can't post again within this window

function doGet() { return json_({status:'ok', message:'CIIINDION endpoint is live'}); }

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.website) return json_({status:'error', message:'Rejected'});
    if (Number(d.elapsed) < MIN_FILL_MS) return json_({status:'error', message:'Too fast'});

    var name = clean_(d.name, 80), email = clean_(d.email, 120), phone = clean_(d.phone, 20), msg = clean_(d.message, 1000);
    if (!/^[\p{L}\p{M}.'\- ]{2,80}$/u.test(name)) return json_({status:'error', message:'Invalid name'});
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({status:'error', message:'Invalid email'});
    var digits = phone.replace(/\D/g, '');
    if (!/^[+\d][\d\s\-()]*$/.test(phone) || digits.length < 10 || digits.length > 15) return json_({status:'error', message:'Invalid phone'});
    if (msg.length < 10) return json_({status:'error', message:'Invalid message'});

    var cache = CacheService.getScriptCache();
    var key = 'e_' + Utilities.base64EncodeWebSafe(email.toLowerCase()).slice(0, 60);
    if (cache.get(key)) return json_({status:'error', message:'Duplicate or too frequent'});

    lock.waitLock(10000);
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName(SHEET_TAB) || ss.insertSheet(SHEET_TAB);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Timestamp', 'Name', 'Email', 'Contact Number', 'Message', 'Submission Status']);
      sh.setFrozenRows(1);
    }
    sh.appendRow([new Date(), safe_(name), safe_(email), safe_(phone), safe_(msg), 'Received']);
    SpreadsheetApp.flush();
    cache.put(key, '1', COOLDOWN_SEC);
    return json_({status:'success'});
  } catch (err) {
    console.error(err);
    return json_({status:'error', message:'Server error'});
  } finally { try { lock.releaseLock(); } catch (x) {} }
}

function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/[<>]/g, '').trim().slice(0, max); }
// Blocks spreadsheet formula injection (cells starting with = + - @).
function safe_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
