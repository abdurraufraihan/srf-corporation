/**
 * SRF Corporation — website lead-form backend (Google Apps Script)
 * ----------------------------------------------------------------
 * Receives POSTs from the contact form on https://srfbd.com and appends
 * each lead as a row in a Google Sheet, plus (optionally) emails a
 * notification to sales@srfbd.com.
 *
 * SETUP (one-time, ~5 minutes):
 *   1. Create a spreadsheet at https://sheets.new (any name, e.g. "SRF Website Leads").
 *   2. In the sheet: Extensions → Apps Script. Delete the default code and
 *      paste this entire file. Save (Ctrl+S).
 *   3. Deploy → New deployment → gear icon → Web app.
 *        Description:  SRF lead form
 *        Execute as:   Me
 *        Who has access: Anyone   ← must be "Anyone", not "Anyone with Google account"
 *   4. Click Deploy. Google will ask you to authorize — it may show an
 *      "unverified app" warning; choose Advanced → Go to … (unsafe).
 *      This is normal for your own personal Apps Script.
 *   5. Copy the Web app URL (ends in /exec) and set it as LEADS_ENDPOINT
 *      in js/main.js.
 *
 * The script creates a "Leads" tab (with header row) on the first lead.
 */

/** Sheet tab where leads are stored. */
var SHEET_NAME = 'Leads';

/** Email address to notify per lead. Set to '' to disable notifications. */
var NOTIFY_TO = 'sales@srfbd.com';

function doPost(e) {
  try {
    var d = {};
    try { d = JSON.parse(e.postData.contents) || {}; } catch (parseErr) { d = {}; }

    // Honeypot tripped → almost certainly a bot. Pretend success so it moves on.
    if (d._gotcha) {
      return text('ok');
    }
    // Basic server-side sanity check (the browser already validates).
    if (!d.name || !d.email || !d.message) {
      return text('missing');
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Timestamp', 'Name', 'Company / Institution', 'Phone',
                    'Email', 'Subject', 'Message', 'Page', 'Referrer']);
      sh.setFrozenRows(1);
    }
    sh.appendRow([
      new Date(),
      d.name,
      d.company || '',
      d.phone || '',
      d.email,
      d.subject || '',
      d.message,
      d.page || '',
      d.referrer || ''
    ]);

    if (NOTIFY_TO) {
      MailApp.sendEmail(
        NOTIFY_TO,
        'New website lead — ' + (d.subject || 'SRF Corporation'),
        'Name:    ' + d.name +
        '\nCompany: ' + (d.company || '—') +
        '\nPhone:   ' + (d.phone || '—') +
        '\nEmail:   ' + d.email +
        '\n\n' + d.message +
        '\n\n—\nSubmitted from ' + (d.page || 'the website')
      );
    }
    return text('ok');
  } catch (err) {
    return text('error');
  }
}

/** Health-check endpoint: open the /exec URL in a browser to verify deployment. */
function doGet() {
  return ContentService.createTextOutput('SRF lead endpoint is live');
}

function text(s) {
  return ContentService.createTextOutput(s);
}
