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
  // ...略...
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
    reply = bookings.length > 0 ? formatBookings(bookings) : `📝 無預約記錄\n立即預約：${BOOKING_FORM_URL}`;
  }
  // 預約相關
  else if (msg.match(/新增|預約|訂車|叫車|約車|我要.*車|想要.*車|需要.*車|要.*接送|機場|去機場|到機場|送機|接機|我要.*機|包車|我要.*包車|想要.*包車/)) {
    reply = `📝 立即預約：${BOOKING_FORM_URL}\n\n🚗 服務項目：\n• 🛫 送機服務\n• 🛬 接機服務\n• 🚐 包車服務\n• 📋 預約查詢`;
  }
  // 修改預約
  else if (msg.includes('修改') || msg.includes('編輯')) {
    reply = `✏️ 查詢與修改：${QUERY_FORM_URL}\n請輸入手機查詢並修改或取消預約`;
  }
  // 取消預約
  else if (msg.includes('取消')) {
    reply = `❌ 取消預約請至：${QUERY_FORM_URL}\n輸入手機查詢後點選取消`;
  }
  // 幫助/歡迎
  else if (msg.match(/幫助|help|功能|menu|選單/)) {
    reply = getWelcomeMessage();
  }
  // 智能回覆
  else {
    reply = getSmartReply(msg);
  }

  replyMessage(event.replyToken, reply);
}

function getWelcomeMessage() {
  return `🚗 歡迎使用道格商號

【快速預約】
輸入「預約」或點擊：
${BOOKING_FORM_URL}

【預約管理】
• 查詢預約 - 查看現有預約
• 修改預約 - 變更預約資訊
• 取消預約 - 取消現有預約

【通知設定】
輸入「綁定 手機號碼」
範例：綁定 0912345678
`;
}

function getSmartReply(msg) {
  const m = msg.toLowerCase();
  
  if (m.match(/預約|訂車|叫車|約車|機場|送機|接機|包車/)) {
    return `🚗 預約接送服務？

📍 服務項目：
• 🛫 送機服務
• 🛬 接機服務
• 🚐 包車服務

立即預約：${BOOKING_FORM_URL}`;
  }
  
  if (m.match(/你好|哈囉|hello/)) {
    return `您好！歡迎使用道格商號 🚗\n\n輸入「幫助」查看功能選單`;
  }
  
  if (m.match(/謝謝|感謝/)) {
    return `很高興為您服務，祝您旅途平安！😊`;
  }

  return `請輸入「幫助」查看所有功能，或直接輸入「預約」、「查詢」等關鍵字操作。`;
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
      'Authorization': `Bearer ${LINE_TOKEN}`
    },
    payload: JSON.stringify(payload)
  });
}

// ==================== 資料庫管理 ====================
function getOrCreateSpreadsheet() {
  // ...略...
}

// ==================== 預約處理 ====================
function doGet(e) {
  // ...略...
}

function handleCreateBooking(params) {
  // ...略...
}

function handleQueryBooking(params) {
  // ...略...
}

function handleUpdateBooking(params) {
  // ...略...
}

function handleCancelBooking(params) {
  // ...略...
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
      'Authorization': `Bearer ${LINE_TOKEN}`
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
  // ...略...
}

function formatBookings(bookings) {
  if (bookings.length === 0) return '📝 目前沒有預約記錄';
  
  let message = '📋 您的預約記錄：\n\n';
  bookings.forEach((booking, index) => {
    message += `#${index + 1}\n`;
    message += `服務：${booking[3]}\n`;
    message += `日期：${formatDate(booking[6])}\n`;
    message += `時間：${booking[7]}\n`;
    message += `路線：${booking[4]} → ${booking[5]}\n`;
    message += `------\n`;
  });
  
  message += `📝 修改預約：${QUERY_FORM_URL}`;
  return message;
}

// ==================== 24小時提醒 ====================
function send24HourReminders() {
  // ...略...
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
  // ...略...
}

// ==================== 設定函數 ====================
function setup24HourReminderTrigger() {
  // ...略...
}

function createSpreadsheetNow() {
  // ...略...
}