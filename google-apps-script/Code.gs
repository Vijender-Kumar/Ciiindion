// This is for the EMAIL integration file

/** CIIINDION contact form -> Google Sheet + Email. Paste into script.google.com (see README.md). */
var SHEET_ID  = '1283LqpVRiUEvWFB0fAULFdzhEOD6fmJMbevmexTV5xM'
var SHEET_TAB = 'Enquiries';
var MIN_FILL_MS = 3000;   // submitted faster than this = bot
var COOLDOWN_SEC = 30;    // same email can't post again within this window

// ===== NEW: email settings =====
var TO_EMAIL   = 'contact@ciiindion.com';   // <-- your Zoho email (receives the enquiry)
var CC_EMAIL   = 'vijbirhman2017@gmail.com';                     // optional, e.g. 'a@x.com,b@y.com' (leave '' for none)
var SENDER_NAME = 'CIIINDION Website';   // name shown as sender
var SEND_AUTO_REPLY = false;              // true = also send "thank you" mail to visitor

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

    // ===== NEW: send emails (after data is safely saved) =====
    // Wrapped in its own try/catch: if mail fails, the Sheet entry is still saved
    // and the visitor still sees success.
    try { sendMails_(name, email, phone, msg); }
    catch (mailErr) { console.error('Mail error: ' + mailErr); }

    return json_({status:'success'});
  } catch (err) {
    console.error(err);
    return json_({status:'error', message:'Server error'});
  } finally { try { lock.releaseLock(); } catch (x) {} }
}

// ===== NEW: email function =====
function sendMails_(name, email, phone, msg) {
  // 1) Notification to you (Zoho inbox)
  var opts = {
    to: TO_EMAIL,
    replyTo: email,                       // "Reply" in Zoho goes to the visitor
    name: SENDER_NAME,
    subject: 'New enquiry from ' + name + ' - ciiindion.com',
    htmlBody:
      '<h3>New enquiry from ciiindion.com</h3>' +
      '<p><b>Name:</b> ' + esc_(name) + '</p>' +
      '<p><b>Email:</b> ' + esc_(email) + '</p>' +
      '<p><b>Phone:</b> ' + esc_(phone) + '</p>' +
      '<p><b>Message:</b><br>' + esc_(msg).replace(/\n/g, '<br>') + '</p>'
  };
  if (CC_EMAIL) opts.cc = CC_EMAIL;
  MailApp.sendEmail(opts);

  // 2) Optional auto-reply to the visitor
  if (SEND_AUTO_REPLY) {
    MailApp.sendEmail({
      to: email,
      replyTo: TO_EMAIL,
      name: 'CIIINDION',
      subject: 'Thanks for contacting CIIINDION',
      htmlBody: '<p>Hi ' + esc_(name) + ',</p>' +
                '<p>Thank you for reaching out. We have received your message and will get back to you soon.</p>' +
                '<p>Regards,<br>Team CIIINDION</p>'
    });
  }
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/[<>]/g, '').trim().slice(0, max); }
// Blocks spreadsheet formula injection (cells starting with = + - @).
function safe_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }


// This is PREVIOUS FILE with the google form
// ------------------------------
// ******************************
// ------------------------------
// This is Previous file with google form


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
