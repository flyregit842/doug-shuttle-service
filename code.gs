// ==================== 道格商號完整預約系統 - 整合版 ====================

// 核心設定 (必須修改)
const LINE_TOKEN = 'IvpYuQCnsZmxvsR1qzC6maYeMKaCwxJc72LShExiaqlVi8WPOSvyfZ0R1cVeGMIC9VyHVi/y5rzfRTzYD2efRWQHTWXw79tXWVMxExikF5Qxfah/bd19zbZPGU7V3YdO9NzMhcV6NlU0zhbSNITqcgdB04t89/1O/w1cDnyilFU=';
const LINE_SECRET = 'fe89e3111f5441f179a1c87a0ec5b864';
const ADMIN_LINE_ID = 'U0b57cc0f9fef1319e146af46ff052554';
const ADMIN_EMAIL = 'jg0989280920@gmail.com';
const BOOKING_FORM_URL = 'https://github.com/flyregit842/doug-shuttle-service/blob/main/index.html';
const QUERY_FORM_URL = 'https://github.com/flyregit842/doug-shuttle-service/blob/main/query.html';

// 試算表設定
const SPREADSHEET_ID = '1J8wuDVtj2U54O-6VGXmGz1x3JGld4cWYiyYN5bED1gQ';
const SHEET_NAME = 'Sheet1';

// ==================== 主要 API 處理函數 ====================
function doPost(e) {
  try {
    // 檢查是否為 LINE Webhook
    if (e.postData && e.postData.contents && e.postData.contents.includes('"events"')) {
      return handleLineWebhook(e);
    }
    
    // 處理表單 API 請求
    const params = parseParameters(e);
    const action = params.action || 'unknown';
    
    switch (action) {
      case 'createBooking':
        return createBooking(params);
      case 'getUserDataByPhone':
        return getUserDataByPhone(params);
      case 'getBookingsByPhone':
        return getBookingsByPhone(params);
      case 'updateBooking':
        return updateBooking(params);
      case 'cancelBooking':
        return cancelBooking(params);
      case 'test':
        return createJSONResponse({success: true, message: 'API 正常運作', version: 'v1.0'});
      default:
        return createJSONResponse({success: false, error: '未知操作: ' + action});
    }
  } catch (error) {
    console.error('doPost error:', error);
    return createJSONResponse({success: false, error: '系統錯誤: ' + error.message});
  }
}

function doGet(e) {
  return doPost(e);
}

// ==================== LINE Webhook 處理 ====================
function handleLineWebhook(e) {
  try {
    const signature = getSignature(e);
    const body = e.postData.contents;
    
    // 暫時跳過簽名驗證
    // if (!verifySignature(signature, body)) {
    //   return ContentService.createTextOutput('Unauthorized');
    // }
    
    const events = JSON.parse(body).events;
    
    events.forEach(event => {
      if (event.type === 'message' && event.message.type === 'text') {
        handleTextMessage(event);
      }
    });
    
    return ContentService.createTextOutput('OK');
    
  } catch (error) {
    console.error('LINE Webhook error:', error);
    return ContentService.createTextOutput('OK');
  }
}

function getSignature(e) {
  // LINE signature 通常在 headers 中
  if (e.parameter && e.parameter['X-Line-Signature']) {
    return e.parameter['X-Line-Signature'];
  }
  return null;
}

function handleTextMessage(event) {
  const msg = event.message.text.trim();
  const userId = event.source.userId;
  let reply = '';

  try {
    // 綁定功能
    if (msg.match(/^綁定\s*(.+)$/)) {
      const phone = msg.replace(/^綁定\s*/, '').trim();
      if (validatePhone(phone)) {
        const result = bindUser(userId, phone);
        reply = result.success ? 
          `綁定成功！手機：${phone}\n現在您會收到預約通知！` :
          `綁定失敗：${result.error}`;
      } else {
        reply = `手機號碼格式錯誤\n正確格式：綁定 0912345678`;
      }
    }
    // 查詢預約
    else if (msg.includes('查詢')) {
      const bookings = getUserBookings(userId);
      reply = bookings.length > 0 ? formatBookings(bookings) : `目前沒有預約記錄\n立即預約：${FORM_URL}`;
    }
    // 預約相關
    else if (msg.match(/新增|預約|訂車|叫車|約車|我要.*車|想要.*車|需要.*車|要.*接送|機場|去機場|到機場|送機|接機|我要.*機|包車|我要.*包車|想要.*包車/)) {
      reply = `立即預約：${FORM_URL}\n\n服務項目：\n• 送機服務\n• 接機服務\n• 包車服務\n• 預約查詢`;
    }
    // 修改預約
    else if (msg.includes('修改') || msg.includes('編輯')) {
      reply = `查詢與修改：${QUERY_URL}\n\n輸入手機查詢後即可修改或取消`;
    }
    // 取消預約
    else if (msg.includes('取消')) {
      reply = `取消預約：${QUERY_URL}\n\n輸入手機後點擊取消\n注意：24小時內取消可能產生費用`;
    }
    // 客服聯絡
    else if (msg.match(/客服|聯絡|電話|人工/)) {
      reply = `聯絡客服\n\n加管理員好友：\nhttps://line.me/ti/p/~${ADMIN_LINE_USER_ID}\n\n電話：0912-345-678`;
    }
    // 幫助或歡迎
    else if (msg.match(/幫助|說明|help|開始/)) {
      reply = getWelcomeMessage();
    }
    // 智能回應
    else {
      reply = getSmartReply(msg);
    }

    replyMessage(event.replyToken, reply);

  } catch (error) {
    console.error('處理訊息錯誤:', error);
    replyMessage(event.replyToken, '系統忙碌中，請稍後再試');
  }
}

function getWelcomeMessage() {
  return `歡迎使用道格商號！

┌─────────────────┐
│  快速預約       │
└─────────────────┘
輸入「預約」或點擊：
${FORM_URL}

┌─────────────────┐
│  預約管理       │  
└─────────────────┘
• 查詢預約 - 查看現有預約
• 修改預約 - 變更預約資訊
• 取消預約 - 取消現有預約

┌─────────────────┐
│  通知設定       │
└─────────────────┘
輸入「綁定 手機號碼」
範例：綁定 0912345678

┌─────────────────┐
│  客服支援       │
└─────────────────┘
• 客服 - 聯絡真人客服

隨時輸入「幫助」查看選單`;
}

function getSmartReply(msg) {
  const m = msg.toLowerCase();
  
  if (m.match(/預約|訂車|叫車|約車|機場|送機|接機|包車/)) {
    return `預約接送服務？\n\n服務項目：\n• 送機服務\n• 接機服務\n• 包車服務\n\n立即預約：${FORM_URL}`;
  }
  
  if (m.match(/你好|哈囉|hello/)) {
    return `您好！歡迎使用道格商號\n\n輸入「幫助」查看功能選單`;
  }
  
  if (m.match(/謝謝|感謝/)) {
    return `不客氣！很高興為您服務\n\n輸入「幫助」查看功能選單`;
  }
  
  return `抱歉，我還在學習...\n\n常用功能：\n• 預約 - 立即預約接送\n• 查詢預約 - 查看現有預約\n• 客服 - 聯絡真人客服\n• 幫助 - 完整功能選單`;
}

function replyMessage(replyToken, message) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  const payload = {
    replyToken: replyToken,
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

// ==================== 預約系統功能 ====================
function createBooking(params) {
  try {
    const required = ['服務項目', '姓名跟稱', '手機號碼', '接送日期', '接送時間', '上車點', '下車點', '費用支付'];
    for (const field of required) {
      if (!params[field] || !params[field].trim()) {
        return createJSONResponse({success: false, message: '缺少必要欄位: ' + field});
      }
    }
    
    const phone = normalizePhone(params['手機號碼']);
    if (!phone || phone.length !== 10) {
      return createJSONResponse({success: false, message: '手機號碼格式不正確'});
    }
    
    const sheet = getSheet();
    const rowData = [
      params['服務項目'] || '', params['公司名稱'] || '', params['部門'] || '', phone, params['姓名跟稱'] || '',
      params['接送日期'] || '', params['接送時間'] || '', params['航班編號'] || '',
      params['上車點'] || '', params['中停點'] || '', params['下車點'] || '', params['備註'] || '',
      params['費用支付'] || '', formatDateTime(new Date()), 'active',
      params['電郵信箱'] || '', params['代理信箱'] || '', params['成本中心'] || '',
      params['金額'] || '', '建立預約', ''
    ];
    
    sheet.appendRow(rowData);
    sheet.getRange(sheet.getLastRow(), 4).setNumberFormat('@');
    
    // 發送通知
    sendCustomerNotification(params, phone);
    sendAdminNotification(params, '新預約');
    
    return createJSONResponse({success: true, message: '預約建立成功'});
    
  } catch (error) {
    console.error('建立預約錯誤:', error);
    return createJSONResponse({success: false, message: '建立失敗: ' + error.message});
  }
}

function getUserDataByPhone(params) {
  try {
    const phone = normalizePhone(params.phone);
    if (!phone) {
      return createJSONResponse({success: false, message: '手機號碼格式不正確'});
    }
    
    const cached = PropertiesService.getScriptProperties().getProperty('user_' + phone);
    if (cached) {
      return createJSONResponse({success: true, data: JSON.parse(cached)});
    }
    
    return createJSONResponse({success: true, data: {}});
    
  } catch (error) {
    return createJSONResponse({success: false, message: '查詢失敗'});
  }
}

function getBookingsByPhone(params) {
  try {
    const phone = normalizePhone(params.phone);
    if (!phone) {
      return createJSONResponse({success: false, message: '手機號碼格式不正確'});
    }
    
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const bookings = [];
    const now = new Date();
    
    data.slice(1).forEach((row, index) => {
      if (normalizePhone(row[3]) === phone && row[14] === 'active') {
        try {
          const bookingDate = new Date(row[5]);
          const [hour, minute] = (row[6] || '00:00').split(':');
          const bookingDateTime = new Date(bookingDate);
          bookingDateTime.setHours(parseInt(hour), parseInt(minute));
          
          if (bookingDateTime > now) {
            bookings.push({
              rowIndex: index + 2,
              service: row[0],
              company: row[1],
              name: row[4],
              date: formatDate(bookingDate),
              time: row[6],
              airport: row[7],
              pickup: row[8],
              midstop: row[9],
              dropoff: row[10],
              remarks: row[11],
              payment: row[12]
            });
          }
        } catch (error) {
          console.error('日期解析錯誤:', error);
        }
      }
    });
    
    return createJSONResponse({success: true, data: bookings});
    
  } catch (error) {
    return createJSONResponse({success: false, message: '查詢失敗'});
  }
}

function updateBooking(params) {
  try {
    const bookingId = parseInt(params.bookingId);
    if (!bookingId) {
      return createJSONResponse({success: false, message: '無效預約ID'});
    }
    
    const sheet = getSheet();
    const data = sheet.getRange(bookingId, 1, 1, 21).getValues()[0];
    
    // 保存原始資料用於通知
    const originalData = {
      '服務項目': data[0],
      '姓名跟稱': data[4],
      '手機號碼': data[3],
      '電郵信箱': data[15],
      '代理信箱': data[16],
      '接送日期': data[5],
      '接送時間': data[6],
      '上車點': data[8],
      '下車點': data[10]
    };
    
    // 更新欄位
    if (params['姓名跟稱']) data[4] = params['姓名跟稱'];
    if (params['公司名稱']) data[1] = params['公司名稱'];
    if (params['部門']) data[2] = params['部門'];
    if (params['接送日期']) data[5] = params['接送日期'];
    if (params['接送時間']) data[6] = params['接送時間'];
    if (params['航班編號']) data[7] = params['航班編號'];
    if (params['上車點']) data[8] = params['上車點'];
    if (params['中停點']) data[9] = params['中停點'];
    if (params['下車點']) data[10] = params['下車點'];
    if (params['備註']) data[11] = params['備註'];
    if (params['費用支付']) data[12] = params['費用支付'];
    if (params['電郵信箱']) data[15] = params['電郵信箱'];
    if (params['代理信箱']) data[16] = params['代理信箱'];
    
    data[19] += ' | ' + formatDateTime(new Date()) + ': 修改預約';
    
    sheet.getRange(bookingId, 1, 1, 21).setValues([data]);
    
    // 準備更新後的資料
    const updatedData = {
      '服務項目': data[0],
      '姓名跟稱': data[4],
      '手機號碼': data[3],
      '電郵信箱': data[15],
      '代理信箱': data[16],
      '接送日期': data[5],
      '接送時間': data[6],
      '航班編號': data[7],
      '上車點': data[8],
      '中停點': data[9],
      '下車點': data[10],
      '備註': data[11],
      '費用支付': data[12],
      '公司名稱': data[1],
      '部門': data[2],
      '成本中心': data[17]
    };
    
    // 發送通知
    sendUpdateNotification(updatedData, originalData);
    sendAdminNotification(updatedData, '預約修改');
    
    return createJSONResponse({success: true, message: '修改成功'});
    
  } catch (error) {
    return createJSONResponse({success: false, message: '修改失敗'});
  }
}

function cancelBooking(params) {
  try {
    const bookingId = parseInt(params.bookingId);
    const sheet = getSheet();
    
    const data = sheet.getRange(bookingId, 1, 1, 21).getValues()[0];
    
    // 保存取消前的資料用於通知
    const cancelData = {
      '服務項目': data[0],
      '姓名跟稱': data[4],
      '手機號碼': data[3],
      '電郵信箱': data[15],
      '代理信箱': data[16],
      '接送日期': data[5],
      '接送時間': data[6],
      '航班編號': data[7],
      '上車點': data[8],
      '中停點': data[9],
      '下車點': data[10],
      '備註': data[11],
      '費用支付': data[12],
      '公司名稱': data[1],
      '部門': data[2],
      '成本中心': data[17]
    };
    
    data[14] = 'cancelled';
    data[19] += ' | ' + formatDateTime(new Date()) + ': 取消預約';
    
    sheet.getRange(bookingId, 1, 1, 21).setValues([data]);
    
    // 發送取消通知
    sendCancelNotification(cancelData);
    sendAdminNotification(cancelData, '預約取消');
    
    return createJSONResponse({success: true, message: '取消成功'});
    
  } catch (error) {
    return createJSONResponse({success: false, message: '取消失敗'});
  }
}

// ==================== 通知系統 ====================
function sendCustomerNotification(params, phone) {
  try {
    // LINE 通知
    const userSheet = getOrCreateSpreadsheet().getSheetByName('LINE用戶綁定');
    if (userSheet) {
      const userData = userSheet.getDataRange().getValues();
      const user = userData.find(row => row[1] === phone);
      if (user) {
        const lineMessage = `預約確認通知\n\n服務：${params['服務項目']}\n日期：${params['接送日期']}\n時間：${params['接送時間']}\n上車：${params['上車點']}\n下車：${params['下車點']}\n\n感謝您的預約！`;
        pushMessage(user[0], lineMessage);
      }
    }
    
    // Email 通知 - 客戶
    const customerEmail = params['電郵信箱'];
    if (customerEmail && customerEmail.trim()) {
      sendCustomerEmail(customerEmail, params, '預約確認');
    }
    
    // Email 通知 - 代理人
    const proxyEmail = params['代理信箱'];
    if (proxyEmail && proxyEmail.trim() && proxyEmail !== customerEmail) {
      sendProxyEmail(proxyEmail, params, '代理預約通知');
    }
    
  } catch (error) {
    console.error('客戶通知錯誤:', error);
  }
}

function sendCustomerEmail(email, params, type) {
  try {
    const subject = `道格商號 - ${type}通知`;
    const body = `
親愛的 ${params['姓名跟稱'] || '客戶'} 您好：

您的預約已確認，詳細資訊如下：

═══════════════════════════
預約資訊
═══════════════════════════
服務項目：${params['服務項目'] || ''}
預約日期：${params['接送日期'] || ''}
預約時間：${params['接送時間'] || ''}
${params['航班編號'] ? `航班編號：${params['航班編號']}\n` : ''}
上車地點：${params['上車點'] || ''}
${params['中停點'] ? `中停地點：${params['中停點']}\n` : ''}
下車地點：${params['下車點'] || ''}
付款方式：${params['費用支付'] || ''}
${params['備註'] ? `備註：${params['備註']}\n` : ''}

═══════════════════════════
聯絡資訊
═══════════════════════════
手機號碼：${params['手機號碼'] || ''}
${params['公司名稱'] ? `公司名稱：${params['公司名稱']}\n` : ''}
${params['部門'] ? `部門：${params['部門']}\n` : ''}

感謝您選擇道格商號接送服務！

如有任何問題，請聯絡我們：
客服電話：0912-345-678
LINE ID：${ADMIN_LINE_USER_ID}

此為系統自動發送郵件，請勿直接回覆。

道格商號
${new Date().toLocaleString('zh-TW')}
`;

    GmailApp.sendEmail(email, subject, body);
    console.log('客戶Email已發送至:', email);
    
  } catch (error) {
    console.error('發送客戶Email錯誤:', error);
  }
}

function sendProxyEmail(email, params, type) {
  try {
    const subject = `道格商號 - ${type}`;
    const body = `
您好：

以下是代理預約的詳細資訊：

═══════════════════════════
預約資訊
═══════════════════════════
預約人員：${params['姓名跟稱'] || ''}
服務項目：${params['服務項目'] || ''}
預約日期：${params['接送日期'] || ''}
預約時間：${params['接送時間'] || ''}
${params['航班編號'] ? `航班編號：${params['航班編號']}\n` : ''}
上車地點：${params['上車點'] || ''}
${params['中停點'] ? `中停地點：${params['中停點']}\n` : ''}
下車地點：${params['下車點'] || ''}
付款方式：${params['費用支付'] || ''}
${params['備註'] ? `備註：${params['備註']}\n` : ''}

═══════════════════════════
聯絡資訊
═══════════════════════════
預約人手機：${params['手機號碼'] || ''}
預約人Email：${params['電郵信箱'] || ''}
${params['公司名稱'] ? `公司名稱：${params['公司名稱']}\n` : ''}
${params['部門'] ? `部門：${params['部門']}\n` : ''}
${params['成本中心'] ? `成本中心：${params['成本中心']}\n` : ''}

作為代理人，您已收到此預約的副本通知。

如有任何問題，請聯絡我們：
客服電話：0912-345-678
LINE ID：${ADMIN_LINE_USER_ID}

此為系統自動發送郵件，請勿直接回覆。

道格商號
${new Date().toLocaleString('zh-TW')}
`;

    GmailApp.sendEmail(email, subject, body);
    console.log('代理人Email已發送至:', email);
    
  } catch (error) {
    console.error('發送代理人Email錯誤:', error);
  }
}

function sendUpdateNotification(updatedData, originalData) {
  try {
    // LINE 通知
    const userSheet = getOrCreateSpreadsheet().getSheetByName('LINE用戶綁定');
    if (userSheet) {
      const userData = userSheet.getDataRange().getValues();
      const user = userData.find(row => row[1] === updatedData['手機號碼']);
      if (user) {
        const lineMessage = `預約修改通知\n\n服務：${updatedData['服務項目']}\n日期：${updatedData['接送日期']}\n時間：${updatedData['接送時間']}\n上車：${updatedData['上車點']}\n下車：${updatedData['下車點']}\n\n您的預約已成功修改！`;
        pushMessage(user[0], lineMessage);
      }
    }
    
    // Email 通知 - 客戶
    const customerEmail = updatedData['電郵信箱'];
    if (customerEmail && customerEmail.trim()) {
      sendUpdateEmail(customerEmail, updatedData, originalData, '預約修改確認', 'customer');
    }
    
    // Email 通知 - 代理人
    const proxyEmail = updatedData['代理信箱'];
    if (proxyEmail && proxyEmail.trim() && proxyEmail !== customerEmail) {
      sendUpdateEmail(proxyEmail, updatedData, originalData, '代理預約修改通知', 'proxy');
    }
    
  } catch (error) {
    console.error('修改通知錯誤:', error);
  }
}

function sendUpdateEmail(email, updatedData, originalData, type, recipient) {
  try {
    const subject = `道格商號 - ${type}`;
    const greeting = recipient === 'customer' ? 
      `親愛的 ${updatedData['姓名跟稱'] || '客戶'} 您好：` : 
      `您好：`;
    
    const body = `
${greeting}

您的預約已成功修改，修改後詳細資訊如下：

═══════════════════════════
修改後預約資訊
═══════════════════════════
服務項目：${updatedData['服務項目'] || ''}
預約日期：${updatedData['接送日期'] || ''}
預約時間：${updatedData['接送時間'] || ''}
${updatedData['航班編號'] ? `航班編號：${updatedData['航班編號']}\n` : ''}
上車地點：${updatedData['上車點'] || ''}
${updatedData['中停點'] ? `中停地點：${updatedData['中停點']}\n` : ''}
下車地點：${updatedData['下車點'] || ''}
付款方式：${updatedData['費用支付'] || ''}
${updatedData['備註'] ? `備註：${updatedData['備註']}\n` : ''}

═══════════════════════════
聯絡資訊
═══════════════════════════
手機號碼：${updatedData['手機號碼'] || ''}
${updatedData['公司名稱'] ? `公司名稱：${updatedData['公司名稱']}\n` : ''}
${updatedData['部門'] ? `部門：${updatedData['部門']}\n` : ''}

如有任何問題，請聯絡我們：
客服電話：0912-345-678
LINE ID：${ADMIN_LINE_USER_ID}

此為系統自動發送郵件，請勿直接回覆。

道格商號
${new Date().toLocaleString('zh-TW')}
`;

    GmailApp.sendEmail(email, subject, body);
    console.log('修改Email已發送至:', email);
    
  } catch (error) {
    console.error('發送修改Email錯誤:', error);
  }
}

function sendCancelNotification(cancelData) {
  try {
    // LINE 通知
    const userSheet = getOrCreateSpreadsheet().getSheetByName('LINE用戶綁定');
    if (userSheet) {
      const userData = userSheet.getDataRange().getValues();
      const user = userData.find(row => row[1] === cancelData['手機號碼']);
      if (user) {
        const lineMessage = `預約取消通知\n\n服務：${cancelData['服務項目']}\n日期：${cancelData['接送日期']}\n時間：${cancelData['接送時間']}\n\n您的預約已成功取消。`;
        pushMessage(user[0], lineMessage);
      }
    }
    
    // Email 通知 - 客戶
    const customerEmail = cancelData['電郵信箱'];
    if (customerEmail && customerEmail.trim()) {
      sendCancelEmail(customerEmail, cancelData, '預約取消確認', 'customer');
    }
    
    // Email 通知 - 代理人
    const proxyEmail = cancelData['代理信箱'];
    if (proxyEmail && proxyEmail.trim() && proxyEmail !== customerEmail) {
      sendCancelEmail(proxyEmail, cancelData, '代理預約取消通知', 'proxy');
    }
    
  } catch (error) {
    console.error('取消通知錯誤:', error);
  }
}

function sendCancelEmail(email, cancelData, type, recipient) {
  try {
    const subject = `道格商號 - ${type}`;
    const greeting = recipient === 'customer' ? 
      `親愛的 ${cancelData['姓名跟稱'] || '客戶'} 您好：` : 
      `您好：`;
    
    const body = `
${greeting}

以下預約已成功取消：

═══════════════════════════
已取消預約資訊
═══════════════════════════
服務項目：${cancelData['服務項目'] || ''}
預約日期：${cancelData['接送日期'] || ''}
預約時間：${cancelData['接送時間'] || ''}
${cancelData['航班編號'] ? `航班編號：${cancelData['航班編號']}\n` : ''}
上車地點：${cancelData['上車點'] || ''}
${cancelData['中停點'] ? `中停地點：${cancelData['中停點']}\n` : ''}
下車地點：${cancelData['下車點'] || ''}
付款方式：${cancelData['費用支付'] || ''}

═══════════════════════════
聯絡資訊
═══════════════════════════
預約人：${cancelData['姓名跟稱'] || ''}
手機號碼：${cancelData['手機號碼'] || ''}
${cancelData['公司名稱'] ? `公司名稱：${cancelData['公司名稱']}\n` : ''}

如需重新預約或有任何問題，請聯絡我們：
客服電話：0912-345-678
LINE ID：${ADMIN_LINE_USER_ID}

此為系統自動發送郵件，請勿直接回覆。

道格商號
${new Date().toLocaleString('zh-TW')}
`;

    GmailApp.sendEmail(email, subject, body);
    console.log('取消Email已發送至:', email);
    
  } catch (error) {
    console.error('發送取消Email錯誤:', error);
  }
}

function sendAdminNotification(params, type) {
  try {
    const message = `${type}通知\n\n手機：${params.phone || params['手機號碼'] || ''}\n服務：${params['服務項目'] || ''}\n時間：${params['接送日期'] || ''} ${params['接送時間'] || ''}\n\n請至試算表查看詳細資料`;
    
    pushMessage(ADMIN_LINE_USER_ID, message);
    
    if (ADMIN_EMAIL) {
      GmailApp.sendEmail(ADMIN_EMAIL, `道格商號 - ${type}通知`, message);
    }
  } catch (error) {
    console.error('管理員通知錯誤:', error);
  }
}

function pushMessage(userId, message) {
  try {
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
  } catch (error) {
    console.error('推送訊息錯誤:', error);
  }
}

// ==================== 用戶綁定系統 ====================
function bindUser(userId, phone) {
  try {
    const ss = getOrCreateSpreadsheet();
    let userSheet = ss.getSheetByName('LINE用戶綁定');
    if (!userSheet) {
      userSheet = ss.insertSheet('LINE用戶綁定');
      userSheet.getRange(1, 1, 1, 3).setValues([['LINE用戶ID', '手機號碼', '綁定時間']]);
    }
    
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
  try {
    const ss = getOrCreateSpreadsheet();
    const userSheet = ss.getSheetByName('LINE用戶綁定');
    if (!userSheet) return [];
    
    const userData = userSheet.getDataRange().getValues();
    const user = userData.find(row => row[0] === userId);
    if (!user) return [];
    
    const bookingSheet = getSheet();
    const bookingData = bookingSheet.getDataRange().getValues();
    
    return bookingData.slice(1)
      .filter(row => normalizePhone(row[3]) === user[1] && row[14] === 'active')
      .filter(row => new Date(row[5]) >= new Date());
  } catch (error) {
    console.error('查詢用戶預約錯誤:', error);
    return [];
  }
}

function formatBookings(bookings) {
  if (bookings.length === 0) return '目前沒有預約記錄';
  
  let message = '您的預約記錄：\n\n';
  bookings.forEach((booking, index) => {
    message += `${index + 1}. ${booking[0]}\n`;
    message += `   日期：${formatDate(booking[5])}\n`;
    message += `   時間：${booking[6]}\n`;
    message += `   路線：${booking[8]} → ${booking[10]}\n\n`;
  });
  
  message += `修改預約：${QUERY_URL}`;
  return message;
}

// ==================== 輔助函數 ====================
function getOrCreateSpreadsheet() {
  let ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  
  if (!ssId) {
    const ss = SpreadsheetApp.create('道格商號預約系統');
    ssId = ss.getId();
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ssId);
    
    const sheet = ss.getActiveSheet();
    sheet.setName('預約記錄');
    const headers = [
      '服務項目', '公司名稱', '部門', '手機號碼', '姓名跟稱', 
      '接送日期', '接送時間', '航班編號', '上車點', '中停點', 
      '下車點', '備註', '費用支付', '提交時間', '狀態',
      '電郵信箱', '代理信箱', '成本中心', '金額', '資料異動追蹤', 'LINE_USER_ID'
    ];
    sheet.getRange(1, 1, 1, 21).setValues([headers]);
    
    console.log('試算表已建立，連結：' + ss.getUrl());
  }
  
  return SpreadsheetApp.openById(ssId);
}

function getSheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  } catch (error) {
    return getOrCreateSpreadsheet().getSheetByName('預約記錄');
  }
}

function parseParameters(e) {
  let params = {};
  
  if (e.parameter) {
    Object.assign(params, e.parameter);
  }
  
  if (e.postData && e.postData.contents) {
    e.postData.contents.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value !== undefined) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
  }
  
  return params;
}

function createJSONResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizePhone(phone) {
  if (!phone) return '';
  let digits = phone.toString().replace(/\D/g, '');
  if (digits.startsWith('886')) digits = '0' + digits.substring(3);
  return (digits.length === 10 && digits.startsWith('0')) ? digits : '';
}

function validatePhone(phone) {
  return /^09\d{8}$/.test(phone);
}

function formatDate(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.getFullYear() + '/' + 
           String(d.getMonth() + 1).padStart(2, '0') + '/' + 
           String(d.getDate()).padStart(2, '0');
  } catch { return ''; }
}

function formatDateTime(date) {
  try {
    const d = date instanceof Date ? date : new Date(date);
    return d.getFullYear() + '/' + 
           String(d.getMonth() + 1).padStart(2, '0') + '/' + 
           String(d.getDate()).padStart(2, '0') + ' ' +
           String(d.getHours()).padStart(2, '0') + ':' + 
           String(d.getMinutes()).padStart(2, '0');
  } catch { return ''; }
}

// ==================== 初始化函數 ====================
function setup() {
  try {
    const ss = getOrCreateSpreadsheet();
    console.log('系統初始化完成');
    console.log('試算表連結：' + ss.getUrl());
    return '初始化成功';
  } catch (error) {
    console.error('初始化錯誤:', error);
    return '初始化失敗: ' + error.message;
  }
}
