/**
 * MESSWAYS — Clean enquiry receiver (fresh sheet structure)
 * Replace the complete Code.gs with this file.
 * Run resetMesswaysEnquiries() ONCE to clear old enquiry rows and create
 * the new ordered columns. Then deploy as a NEW web-app version.
 */
const MESSWAYS_CONFIG = {
  SPREADSHEET_ID: '1YXMiUa71h3sgjHm5l7HJEGg84oCh4MzT4eSmiI9d4G8',
  SHEET_NAME: 'Enquiries'
};

const MESSWAYS_HEADERS = [
  'Date received',
  'Full name',
  'Country calling code',
  'Local phone number',
  'Full phone number',
  'Specialised training',
  'Package',
  'Format',
  'Current level',
  'Objective / skill to develop',
  'Source'
];

function doGet() {
  return ContentService.createTextOutput('MESSWAYS enquiry endpoint is active.');
}

function doPost(e) {
  try {
    const data = (e && e.parameter) ? e.parameter : {};
    const countryCode = normalizeCountryCode_(data.countryCode || data.country_code || data.callingCode || '');
    const localPhone = normalizePhone_(data.phone || data.localPhone || data.local_phone || '');
    if (!countryCode || !localPhone) {
      throw new Error('Missing or invalid country calling code / phone number. Received countryCode=' + String(data.countryCode || '') + ', phone=' + String(data.phone || ''));
    }

    const ss = SpreadsheetApp.openById(MESSWAYS_CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateEnquiriesSheet_(ss);
    const fullPhone = countryCode + ' ' + localPhone;
    const row = [
      new Date(),
      clean_(data.name),
      countryCode,
      localPhone,
      fullPhone,
      clean_(data.course),
      clean_(data.plan),
      clean_(data.format),
      clean_(data.level),
      clean_(data.message),
      clean_(data.source || 'MESSWAYS Website')
    ];
    sheet.appendRow(row);
    return response_(true, 'Saved');
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return response_(false, String(err && err.message ? err.message : err));
  }
}

/**
 * DESTRUCTIVE RESET — run manually once if you accept losing old enquiry rows.
 * Keeps the spreadsheet and Enquiries tab, clears its contents, then rebuilds
 * the columns in the exact order defined above.
 */
function resetMesswaysEnquiries() {
  const ss = SpreadsheetApp.openById(MESSWAYS_CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(MESSWAYS_CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(MESSWAYS_CONFIG.SHEET_NAME);
  sheet.clear();
  sheet.getRange(1, 1, 1, MESSWAYS_HEADERS.length).setValues([MESSWAYS_HEADERS]);
  formatEnquiriesSheet_(sheet);
  return 'Reset complete. Old enquiry rows were cleared and the new column order is ready.';
}

/** Non-destructive maintenance: creates the tab if missing and checks headers. */
function setupMesswaysEnquiries() {
  const ss = SpreadsheetApp.openById(MESSWAYS_CONFIG.SPREADSHEET_ID);
  const sheet = getOrCreateEnquiriesSheet_(ss);
  formatEnquiriesSheet_(sheet);
  return 'MESSWAYS Enquiries sheet is ready.';
}

function getOrCreateEnquiriesSheet_(ss) {
  let sheet = ss.getSheetByName(MESSWAYS_CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(MESSWAYS_CONFIG.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, MESSWAYS_HEADERS.length).setValues([MESSWAYS_HEADERS]);
  } else {
    const current = sheet.getRange(1, 1, 1, MESSWAYS_HEADERS.length).getDisplayValues()[0];
    const matches = MESSWAYS_HEADERS.every((header, i) => current[i] === header);
    if (!matches) {
      throw new Error('The Enquiries sheet has the old column layout. Run resetMesswaysEnquiries() once to rebuild it.');
    }
  }
  formatEnquiriesSheet_(sheet);
  return sheet;
}

function formatEnquiriesSheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, MESSWAYS_HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#101010')
    .setFontColor('#ffffff')
    .setWrap(true);
  sheet.setColumnWidth(1, 165);
  sheet.setColumnWidth(2, 190);
  sheet.setColumnWidth(3, 145);
  sheet.setColumnWidth(4, 155);
  sheet.setColumnWidth(5, 175);
  sheet.setColumnWidths(6, 6, 210);
  sheet.getRange('C:E').setNumberFormat('@');
  sheet.getDataRange().setVerticalAlignment('middle');
  sheet.autoResizeRows(1, Math.max(sheet.getLastRow(), 1));
}

function normalizeCountryCode_(value) {
  let code = String(value || '').trim().replace(/[^+0-9]/g, '');
  if (code && code.charAt(0) !== '+') code = '+' + code;
  return /^\+[1-9][0-9]{0,3}$/.test(code) ? code : '';
}

function normalizePhone_(value) {
  return String(value || '').replace(/\D/g, '').trim();
}

function clean_(value) {
  return String(value || '').trim().replace(/[\r\n]+/g, ' ').slice(0, 5000);
}

function response_(success, message) {
  const payload = JSON.stringify({ type: 'messways_enquiry_result', success: Boolean(success), message: String(message || '') });
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><meta charset="utf-8"></head><body><script>' +
    'window.top.postMessage(' + payload + ', "*");' +
    '</script></body></html>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
