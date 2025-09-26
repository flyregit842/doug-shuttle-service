// ==================== 道格商號預約系統 - 精簡完整版 ====================

// 核心設定 (必須修改)
const LINE_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_TOKEN');
const LINE_SECRET = PropertiesService.getScriptProperties().getProperty('LINE_SECRET');
const ADMIN_LINE_USER_ID = PropertiesService.getScriptProperties().getProperty('ADMIN_LINE_USER_ID');
const ADMIN_EMAIL = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
const BOOKING_FORM_URL = 'https://github.com/flyregit842/doug-shuttle-service/blob/main/index.html';
const QUERY_FORM_URL = 'https://github.com/flyregit842/doug-shuttle-service/blob/main/query.html';

// ==================== LINE Webhook 處理 ====================
function doPost(e) {
  try {
    // 取得 LINE signature 和請求內容
    const signature = e.parameter && e.parameter['X-Line-Signature'] ? 
      e.parameter['X-Line-Signature'] : 
      (e.postData && e.postData.headers ? e.postData.headers['X-Line-Signature'] : null);
    
    const body = e.postData && e.postData.contents ? e.postData.contents : null;
    
    console.log('Webhook received - Signature:', signature ? 'present' : 'missing');
    console.log('Body length:', body ? body.length : 'missing');
    
    if (!body) {
      console.log('No body content');
      return createResponse('Bad Request');
    }
    
    // 暫時跳過簽名驗證來測試基本功能
    // if (signature && !verifySignature(signature, body)) return createResponse('Unauthorized');
    
    const events = JSON.parse(body).events;
    console.log('Events received:', events.length);
    
    events.forEach(event => {
      console.log('Processing event type:', event.type);
      if (event.type === 'message' && event.message.type === 'text') {
        console.log('Processing text message:', event.message.text);
        handleTextMessage(event);
      }
    });
    
    return createResponse('OK');
  } catch (error) {
    console.error('doPost error:', error);
    return createResponse('Error');
  }
}

function verifySignature(signature, body) {
  const hash = Utilities.computeHmacSha256Signature(body, LINE_CHANNEL_SECRET);
  const hashBase64 = Utilities.base64Encode(hash);
  return signature === `SHA256=${hashBase64}`;
}

function createResponse(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}

// ==================== LINE Bot 訊息處理 ====================
function handleTextMessage(event) {
  const msg = event.message.text.trim();
  const userId = event.source.userId;
  let reply = '';

  // 綁定功能
  if (msg.match(/^綁定\s*(.+)$/)) {
    const phone = msg.replace(/^綁定\s*/, '').trim();
    if (validatePhone(phone)) {
      const result = bindUser(userId, phone);
      reply = result.success ? `✅ 綁定成功！手機：${phone}\n現在您會收到預約通知！` : `❌ 綁定失敗：${result.error}`;
    } else {
      reply = `❌ 格式錯誤\n正確格式：綁定 0912345678`;
    }
  }
  // 查詢預約
  else if (msg.includes('查詢')) {
    const bookings = getUserBookings(userId);
    reply = bookings.length > 0 ? formatBookings(bookings) : `📝 無預約記錄\n立即預約：${FORM_URL}`;
  }
  // 預約相關
  else if (msg.match(/新增|預約|訂車|叫車|約車|我要.*車|想要.*車|需要.*車|要.*接送|機場|去機場|到機場|送機|接機|我要.*機|包車|我要.*包車|想要.*包車/)) {
    reply = `📝 立即預約：${FORM_URL}\n\n🚗 服務項目：\n• 🛫 送機服務\n• 🛬 接機服務\n• 🚐 包車服務\n• 📋 預約查詢`;
  }
  // 修改預約
  else if (msg.includes('修改') || msg.includes('編輯')) {
    reply = `✏️ 查詢與修改：${QUERY_URL}\n\n輸入手機查詢後即可修改或取消`;
  }
  // 取消預約
  else if (msg.includes('取消')) {
    reply = `🚫 取消預約：${QUERY_URL}\n\n輸入手機後點擊取消\n⚠️ 24小時內取消可能產生費用`;
  }
  // 客服聯絡
  else if (msg.match(/客服|聯絡|電話|人工/)) {
    reply = `👨‍💼 聯絡客服\n\n🔸 加管理員好友：\nhttps://line.me/ti/p/~${ADMIN_LINE_USER_ID}\n\n🔸 電話：0912-345-678`;
  }
  // 幫助或歡迎
  else if (msg.match(/幫助|說明|help|開始/)) {
    reply = getWelcomeMessage();
  }
  // 智能回應
  else {
    reply = getSmartReply(msg);
  }

  return replyMessage(event.replyToken, reply);
}

function getWelcomeMessage() {
  return `🚗 歡迎使用道格商號！

┌─────────────────┐
│  🚀 快速預約     │
└─────────────────┘
輸入「預約」或點擊：
${FORM_URL}

┌─────────────────┐
│  📋 預約管理     │  
└─────────────────┘
• 查詢預約 - 查看現有預約
• 修改預約 - 變更預約資訊  
• 取消預約 - 取消現有預約

┌─────────────────┐
│  🔔 通知設定     │
└─────────────────┘
輸入「綁定 手機號碼」
範例：綁定 0912345678

┌─────────────────┐
│  ℹ️  客服支援     │
└─────────────────┘
• 客服 - 聯絡真人客服

💡 隨時輸入「幫助」查看選單`;
}

function getSmartReply(msg) {
  const m = msg.toLowerCase();
  
  if (m.match(/預約|訂車|叫車|約車|機場|送機|接機|包車/)) {
    return `🚗 預約接送服務？\n\n📍 服務項目：\n• 🛫 送機服務\n• 🛬 接機服務\n• 🚐 包車服務\n\n立即預約：${FORM_URL}`;
  }
  
  if (m.match(/你好|哈囉|hello/)) {
    return `您好！歡迎使用道格商號 🚗\n\n輸入「幫助」查看功能選單`;
  }
  
  if (m.match(/謝謝|感謝/)) {
    return `不客氣！很高興為您服務 😊\n\n輸入「幫助」查看功能選單`;
  }
  
  return `🤔 抱歉，我還在學習...\n\n常用功能：\n🔸 預約 - 立即預約接送\n🔸 查詢預約 - 查看現有預約\n🔸 客服 - 聯絡真人客服\n🔸 幫助 - 完整功能選單`;
}

function replyMessage(replyToken, message) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  const payload = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: message }]
  };
  
  return UrlFetchApp.fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
    },
    payload: JSON.stringify(payload)
  });
}

// ==================== 資料庫管理 ====================
function getOrCreateSpreadsheet() {
  let spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  
  if (!spreadsheetId) {
    const ss = SpreadsheetApp.create('道格商號預約系統');
    spreadsheetId = ss.getId();
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
    
    // 建立預約記錄工作表
    const bookingSheet = ss.getActiveSheet();
    bookingSheet.setName('預約記錄');
    bookingSheet.getRange(1, 1, 1, 12).setValues([
      ['時間戳記', '姓名', '手機', '服務類型', '上車地點', '下車地點', '預約日期', '預約時間', '乘客人數', '備註', '狀態', 'LINE用戶ID']
    ]);
    
    // 建立LINE用戶綁定工作表
    const userSheet = ss.insertSheet('LINE用戶綁定');
    userSheet.getRange(1, 1, 1, 3).setValues([['LINE用戶ID', '手機號碼', '綁定時間']]);
    
    console.log('試算表已建立，連結：' + ss.getUrl());
  }
  
  return SpreadsheetApp.openById(spreadsheetId);
}

// ==================== 預約處理 ====================
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'create':
        return handleCreateBooking(e.parameter);
      case 'query':
        return handleQueryBooking(e.parameter);
      case 'update':
        return handleUpdateBooking(e.parameter);
      case 'cancel':
        return handleCancelBooking(e.parameter);
      default:
        return createJSONResponse({success: false, error: '無效操作'});
    }
  } catch (error) {
    console.error('doGet error:', error);
    return createJSONResponse({success: false, error: error.toString()});
  }
}

function handleCreateBooking(params) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('預約記錄');
  
  const row = [
    new Date(),
    params.name,
    params.phone,
    params.service,
    params.pickup,
    params.dropoff,
    params.date,
    params.time,
    params.passengers || '1',
    params.notes || '',
    '已預約',
    ''
  ];
  
  sheet.appendRow(row);
  
  // 延遲發送通知
  Utilities.sleep(1000);
  sendCustomerNotification(params);
  sendAdminNotification(params, '新預約');
  
  return createJSONResponse({success: true, message: '預約成功！'});
}

function handleQueryBooking(params) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('預約記錄');
  const data = sheet.getDataRange().getValues();
  
  const bookings = data.slice(1)
    .filter(row => row[2] === params.phone && row[10] === '已預約')
    .filter(row => new Date(row[6]) >= new Date(new Date().setHours(0,0,0,0)))
    .map((row, index) => ({
      id: getRowNumber(sheet, row),
      name: row[1],
      phone: row[2],
      service: row[3],
      pickup: row[4],
      dropoff: row[5],
      date: formatDate(row[6]),
      time: row[7],
      passengers: row[8],
      notes: row[9],
      status: row[10]
    }));
  
  return createJSONResponse({success: true, data: bookings});
}

function handleUpdateBooking(params) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('預約記錄');
  
  const row = parseInt(params.id);
  sheet.getRange(row, 2, 1, 9).setValues([[
    params.name, params.phone, params.service, params.pickup, 
    params.dropoff, params.date, params.time, params.passengers, params.notes
  ]]);
  
  Utilities.sleep(1000);
  sendAdminNotification(params, '預約修改');
  
  return createJSONResponse({success: true, message: '修改成功！'});
}

function handleCancelBooking(params) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('預約記錄');
  
  sheet.getRange(parseInt(params.id), 11).setValue('已取消');
  
  Utilities.sleep(1000);
  sendAdminNotification({phone: params.phone}, '預約取消');
  
  return createJSONResponse({success: true, message: '取消成功！'});
}

function createJSONResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== 通知系統 ====================
function sendCustomerNotification(params) {
  const ss = getOrCreateSpreadsheet();
  const userSheet = ss.getSheetByName('LINE用戶綁定');
  const userData = userSheet.getDataRange().getValues();
  
  const user = userData.find(row => row[1] === params.phone);
  if (!user) return;
  
  const message = `📅 預約確認通知\n\n服務：${params.service}\n日期：${params.date}\n時間：${params.time}\n上車：${params.pickup}\n下車：${params.dropoff}\n\n感謝您的預約！`;
  
  pushMessage(user[0], message);
}

function sendAdminNotification(params, type) {
  const message = `🔔 ${type}通知\n\n手機：${params.phone}\n服務：${params.service || ''}\n時間：${params.date || ''} ${params.time || ''}\n\n請至試算表查看詳細資料`;
  
  pushMessage(ADMIN_LINE_USER_ID, message);
  
  const subject = `道格商號 - ${type}通知`;
  const body = `${type}詳細資訊：\n\n手機：${params.phone}\n服務：${params.service || ''}\n時間：${params.date || ''} ${params.time || ''}\n\n請登入 Google Sheets 查看完整資料。`;
  
  GmailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

function pushMessage(userId, message) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: userId,
    messages: [{ type: 'text', text: message }]
  };
  
  UrlFetchApp.fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
    },
    payload: JSON.stringify(payload)
  });
}

// ==================== 用戶綁定 ====================
function bindUser(userId, phone) {
  try {
    const ss = getOrCreateSpreadsheet();
    const userSheet = ss.getSheetByName('LINE用戶綁定');
    const data = userSheet.getDataRange().getValues();
    
    const existing = data.find(row => row[0] === userId || row[1] === phone);
    if (existing) {
      if (existing[0] === userId) return {success: false, error: '此LINE帳號已綁定其他手機'};
      if (existing[1] === phone) return {success: false, error: '此手機已綁定其他LINE帳號'};
    }
    
    userSheet.appendRow([userId, phone, new Date()]);
    return {success: true};
  } catch (error) {
    return {success: false, error: error.toString()};
  }
}

function getUserBookings(userId) {
  const ss = getOrCreateSpreadsheet();
  const userSheet = ss.getSheetByName('LINE用戶綁定');
  const bookingSheet = ss.getSheetByName('預約記錄');
  
  const userData = userSheet.getDataRange().getValues();
  const user = userData.find(row => row[0] === userId);
  if (!user) return [];
  
  const bookingData = bookingSheet.getDataRange().getValues();
  return bookingData.slice(1)
    .filter(row => row[2] === user[1] && row[10] === '已預約')
    .filter(row => new Date(row[6]) >= new Date());
}

function formatBookings(bookings) {
  if (bookings.length === 0) return '📝 目前沒有預約記錄';
  
  let message = '📋 您的預約記錄：\n\n';
  bookings.forEach((booking, index) => {
    message += `${index + 1}. ${booking[3]}\n`;
    message += `   日期：${formatDate(booking[6])}\n`;
    message += `   時間：${booking[7]}\n`;
    message += `   路線：${booking[4]} → ${booking[5]}\n\n`;
  });
  
  message += `📝 修改預約：${QUERY_URL}`;
  return message;
}

// ==================== 24小時提醒 ====================
function send24HourReminders() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName('預約記錄');
  const data = sheet.getDataRange().getValues();
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDate(tomorrow);
  
  const reminders = data.slice(1).filter(row => 
    formatDate(row[6]) === tomorrowStr && row[10] === '已預約'
  );
  
  reminders.forEach(booking => sendCustomerReminder(booking));
  
  if (reminders.length > 0) {
    sendAdminSummary(reminders);
  }
}

function sendCustomerReminder(booking) {
  const phone = booking[2];
  const ss = getOrCreateSpreadsheet();
  const userSheet = ss.getSheetByName('LINE用戶綁定');
  const userData = userSheet.getDataRange().getValues();
  
  const user = userData.find(row => row[1] === phone);
  if (!user) return;
  
  const message = `🔔 明日預約提醒\n\n服務：${booking[3]}\n時間：${booking[7]}\n上車：${booking[4]}\n\n請準時出發！有問題請聯絡客服。`;
  
  pushMessage(user[0], message);
}

function sendAdminSummary(reminders) {
  let message = `📊 明日預約彙總 (共${reminders.length}筆)\n\n`;
  reminders.forEach((booking, index) => {
    message += `${index + 1}. ${booking[7]} ${booking[1]} (${booking[2]})\n`;
    message += `   ${booking[3]} - ${booking[4]}\n\n`;
  });
  
  pushMessage(ADMIN_LINE_USER_ID, message);
  GmailApp.sendEmail(ADMIN_EMAIL, '道格商號 - 明日預約彙總', message);
}

// ==================== 輔助函數 ====================
function validatePhone(phone) {
  return /^09\d{8}$/.test(phone);
}

function formatDate(date) {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

function getRowNumber(sheet, targetRow) {
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][1] === targetRow[1] && data[i][2] === targetRow[2]) {
      return i + 1;
    }
  }
  return 0;
}

// ==================== 設定函數 ====================
function setup24HourReminderTrigger() {
  ScriptApp.newTrigger('send24HourReminders')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  
  console.log('24小時提醒觸發器已設定完成！');
}

function createSpreadsheetNow() {
  const ss = getOrCreateSpreadsheet();
  console.log('試算表已建立！');
  console.log('連結：' + ss.getUrl());
  console.log('ID：' + ss.getId());
}
