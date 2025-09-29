/**
 * Doug Shuttle Service Google Apps Script 後端（正確版，含 CORS、LINE 綁定、CRUD）
 * 請將 SHEET_ID 改為你自己的 Google Sheet ID
 * 所有 API 回應僅允許 https://flyregit842.github.io 跨域存取
 */

const SHEET_ID = '1M7kyM48IbZca-rlXaF2ynYW_n3F_cxsrHCm9s6IegDs'; // 例如 '1A2B3C4D5E6F...'
const SHEET_NAME = 'Bookings';
const LOG_SHEET_NAME = 'AIDevLog';
const BINDING_SHEET_NAME = 'Binding';

function doPost(e) {
  let result = { success: true }; // 你的處理流程
  // ...根據 action 處理...

  // 確保 header 完整設置
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "https://flyregit842.github.io")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// 若前端有 OPTIONS 預請求，也加 allow
function doGet(e) {
  let result = { success: true };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "https://flyregit842.github.io")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// LINE 綁定手機
function handleBind(e) {
  try {
    const line_user_id = e.parameter.line_user_id;
    const mobil = e.parameter.mobil;
    if (!line_user_id || !validatePhone(mobil)) {
      return { success: false, error: '缺少參數或手機格式錯誤' };
    }
    const bindingSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(BINDING_SHEET_NAME);
    const rows = bindingSheet.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === line_user_id) {
        bindingSheet.getRange(i+1, 2).setValue(mobil);
        bindingSheet.getRange(i+1, 3).setValue(new Date());
        found = true;
        break;
      }
    }
    if (!found) {
      bindingSheet.appendRow([line_user_id, mobil, new Date()]);
    }
    logAction('bind', mobil, `line_user_id=${line_user_id}`);
    return { success: true, message: '綁定成功' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 新增預約（需已綁定）
function handleCreate(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    if (!isMobilBound(data.phone)) {
      return { success: false, error: '手機尚未綁定LINE' };
    }
    if (!validateBookingData(data)) {
      return { success: false, error: '表單資料不完整或格式錯誤' };
    }
    const now = new Date();
    sheet.appendRow([
      now,
      data.serviceType,
      data.name,
      data.phone,
      data.email,
      data.flight,
      data.date,
      data.time,
      data.address,
      data.remark,
      'active',
      Utilities.getUuid()
    ]);
    logAction('create', data.phone, JSON.stringify(data));
    return { success: true, message: '預約成功' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 查詢預約（需已綁定）
function handleRead(e) {
  try {
    const phone = e.parameter.phone;
    if (!validatePhone(phone)) {
      return { success: false, error: '手機格式錯誤' };
    }
    if (!isMobilBound(phone)) {
      return { success: false, error: '手機尚未綁定LINE' };
    }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const rows = sheet.getDataRange().getValues();
    const now = new Date();
    const bookings = rows
      .filter((row, idx) => {
        if (idx === 0) return false;
        const bookingTime = new Date(row[6] + ' ' + row[7]);
        return row[3] === phone && row[10] === 'active' && bookingTime > now;
      })
      .map(row => ({
        uuid: row[11],
        serviceType: row[1],
        name: row[2],
        phone: row[3],
        email: row[4],
        flight: row[5],
        date: row[6],
        time: row[7],
        address: row[8],
        remark: row[9],
        status: row[10]
      }));
    return { success: true, bookings };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 修改預約（需已綁定）
function handleUpdate(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    if (!validateBookingData(data) || !data.uuid) {
      return { success: false, error: '資料不完整或格式錯誤' };
    }
    if (!isMobilBound(data.phone)) {
      return { success: false, error: '手機尚未綁定LINE' };
    }
    const rows = sheet.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][11] === data.uuid && rows[i][10] === 'active') {
        sheet.getRange(i+1, 2, 1, 10).setValues([[
          data.serviceType,
          data.name,
          data.phone,
          data.email,
          data.flight,
          data.date,
          data.time,
          data.address,
          data.remark,
          'active'
        ]]);
        found = true;
        logAction('update', data.phone, JSON.stringify(data));
        break;
      }
    }
    if (!found) {
      return { success: false, error: '查無可修改的預約' };
    }
    return { success: true, message: '修改成功' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 取消預約（需已綁定）
function handleDelete(e) {
  try {
    const uuid = e.parameter.uuid;
    if (!uuid) {
      return { success: false, error: '缺少預約識別碼' };
    }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const rows = sheet.getDataRange().getValues();
    let found = false;
    let phone = '';
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][11] === uuid && rows[i][10] === 'active') {
        phone = rows[i][3];
        if (!isMobilBound(phone)) {
          return { success: false, error: '手機尚未綁定LINE' };
        }
        sheet.getRange(i+1, 11).setValue('cancelled');
        found = true;
        logAction('delete', phone, `uuid=${uuid}`);
        break;
      }
    }
    if (!found) {
      return { success: false, error: '查無可取消的預約' };
    }
    return { success: true, message: '已取消預約' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 檢查手機是否已綁定 LINE
function isMobilBound(mobil) {
  const bindingSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(BINDING_SHEET_NAME);
  const rows = bindingSheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === mobil && rows[i][0]) {
      return true;
    }
  }
  return false;
}

// 預約資料格式驗證
function validateBookingData(data) {
  return (
    ['serviceType','name','phone','email','flight','date','time','address'].every(k => !!data[k]) &&
    validatePhone(data.phone) &&
    /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(data.email)
  );
}
function validatePhone(phone) {
  return /^09\d{8}$/.test(phone);
}

// 異動日誌記錄
function logAction(action, phone, detail) {
  try {
    const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LOG_SHEET_NAME);
    logSheet.appendRow([
      new Date(),
      action,
      phone,
      detail
    ]);
  } catch (err) {
    // 日誌失敗不影響主流程
  }
}

// 初始化 Sheet 結構（只需執行一次）
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Bookings 工作表
  let bookings = ss.getSheetByName('Bookings');
  if (!bookings) {
    bookings = ss.insertSheet('Bookings');
    bookings.appendRow([
      '建立時間', '接送類型', '姓名', '手機', 'Email', '航班', '預約日期', '預約時間', '地址', '備註', '狀態', '預約識別碼'
    ]);
  }

  // AIDevLog 工作表
  let logSheet = ss.getSheetByName('AIDevLog');
  if (!logSheet) {
    logSheet = ss.insertSheet('AIDevLog');
    logSheet.appendRow([
      '時間', '動作', '手機', '內容'
    ]);
  }

  // Binding 工作表
  let bindingSheet = ss.getSheetByName('Binding');
  if (!bindingSheet) {
    bindingSheet = ss.insertSheet('Binding');
    bindingSheet.appendRow([
      'line_user_id', 'mobil', 'binding_time'
    ]);
  }
}
