To AI Agent, 以下說明為當時紀錄，並不代表木最新進度
系統發以疊代改進進行完善，AI 可提供改進意見，獲得同意即可進行，但請自動或提醒擁有者備份
AI Agent如有權限請在此留下開發日誌供後續參考
系統目標期望除功能完備、執行正確外，希望能最大程度自動化、提升效率

---

## 📚 開發者指南 / Developer Guide

**想使用 GitHub Copilot Chat 協助開發？**  
- 📖 [COPILOT_USAGE.md](COPILOT_USAGE.md) - 完整的 Copilot Chat 使用指南
- ⚡ [.github/COPILOT_QUICK_START.md](.github/COPILOT_QUICK_START.md) - 快速開始指南
- 💡 [COPILOT_EXAMPLES.md](COPILOT_EXAMPLES.md) - 10個實際使用範例

**Want to use GitHub Copilot Chat for development?**  
- 📖 [COPILOT_USAGE.md](COPILOT_USAGE.md) - Complete guide for using Copilot Chat
- ⚡ [.github/COPILOT_QUICK_START.md](.github/COPILOT_QUICK_START.md) - Quick start guide
- 💡 [COPILOT_EXAMPLES.md](COPILOT_EXAMPLES.md) - 10 practical examples

---

Doug Shuttle Service 系統完整文檔
系統概述
系統名稱： Doug Shuttle Service - 機場接送預約系統
版本： v9.3 Final
開發日期： 2025-09-23
架構： 前端 HTML/JavaScript + 後端 Google Apps Script
檔案結構
Doug Shuttle Service/
├── index.html          # 主要預約表單頁面
├── query.html          # 查詢預約頁面  
└── Code.gs            # Google Apps Script 後端程式
完整程式源碼
1. index.html - 主要預約表單
html<!-- 
檔案名稱: index.html
系統名稱: Doug Shuttle Service - 機場接送預約表單  
修正內容: 1.移除確認頁面多餘標題 2.修正時間顯示問題 3.統一用字為"資料"
-->
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doug Shuttle Service - 機場接送預約</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px 20px; text-align: center; color: white; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .service-reminder { background: #f8f9fa; padding: 15px; text-align: center; color: #495057; font-weight: 500; border-bottom: 2px solid #e9ecef; }
        .form-container { padding: 30px; }
        .step { display: none; }
        .step.active { display: block; }
        .service-selection { display: grid; gap: 15px; margin-bottom: 30px; }
        .service-option { padding: 20px; border: 2px solid #e9ecef; border-radius: 15px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: white; }
        .service-option:hover { border-color: #4facfe; background: #f8f9fa; }
        .service-option.selected { border-color: #4facfe; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
        .service-option h3 { margin-bottom: 10px; font-size: 20px; }
        .service-option p { color: #666; font-size: 14px; }
        .service-option.selected p { color: rgba(255,255,255,0.8); }
        .form-group { margin-bottom: 25px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
        .required::after { content: " *"; color: #dc3545; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 15px; border: 2px solid #e9ecef; border-radius: 10px; font-size: 16px; transition: border-color 0.3s ease; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #4facfe; }
        .time-input-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .btn { width: 100%; padding: 18px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
        .btn-primary { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(79, 172, 254, 0.3); }
        .btn-secondary { background: #f8f9fa; color: #666; margin-bottom: 15px; }
        .btn-secondary:hover { background: #e9ecef; }
        .loading { display: none; text-align: center; padding: 20px; }
        .loading.show { display: block; }
        .confirmation-section { background: #f8f9fa; border-radius: 15px; padding: 25px; margin-bottom: 25px; }
        .confirmation-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #dee2e6; }
        .confirmation-item:last-child { border-bottom: none; }
        .confirmation-label { font-weight: 600; color: #495057; }
        .confirmation-value { color: #212529; text-align: right; max-width: 60%; word-wrap: break-word; }
        .success-message, .error-message { padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center; }
        .success-message { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error-message { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        @media (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .form-container { padding: 20px; }
            .confirmation-item { flex-direction: column; gap: 5px; }
            .confirmation-value { text-align: left; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Doug Shuttle Service</h1>
            <p>專業機場接送服務</p>
        </div>

        <div id="serviceReminder" class="service-reminder" style="display: none;">
            <span id="selectedServiceText"></span>
        </div>

        <div class="form-container">
            <!-- 步驟1：選擇服務類型 -->
            <div id="step1" class="step active">
                <div class="service-selection">
                    <div class="service-option" data-service="送機">
                        <h3>🚗 送機服務</h3>
                        <p>從指定地點前往機場</p>
                    </div>
                    <div class="service-option" data-service="接機">
                        <h3>✈️ 接機服務</h3>
                        <p>從機場前往指定地點</p>
                    </div>
                    <div class="service-option" data-service="包車">
                        <h3>🚙 包車服務</h3>
                        <p>自訂路線包車服務</p>
                    </div>
                    <div class="service-option" data-action="query">
                        <h3>🔍 查詢預約</h3>
                        <p>查詢現有預約記錄</p>
                    </div>
                </div>
            </div>

            <!-- 步驟2：基本資料 -->
            <div id="step2" class="step">
                <h2 style="margin-bottom: 30px; text-align: center; color: #333;">基本資料</h2>
                
                <div class="form-group">
                    <label for="phone" class="required">手機號碼</label>
                    <input type="tel" id="phone" name="phone" maxlength="10">
                    <div id="loadingUserData" class="loading">
                        <p>🔍 正在查詢您的資料...</p>
                    </div>
                </div>

                <div class="form-group">
                    <label for="name" class="required">姓名職稱</label>
                    <input type="text" id="name" name="name" required>
                </div>

                <div class="form-group">
                    <label for="company">公司名稱</label>
                    <input type="text" id="company" name="company">
                </div>

                <div class="form-group">
                    <label for="department">部門</label>
                    <input type="text" id="department" name="department">
                </div>

                <button type="button" class="btn btn-secondary" onclick="previousStep()">上一步</button>
                <button type="button" class="btn btn-primary" onclick="nextStep()">下一步</button>
            </div>

            <!-- 步驟3：接送資料 -->
            <div id="step3" class="step">
                <h2 style="margin-bottom: 30px; text-align: center; color: #333;">接送資料</h2>

                <div class="form-group">
                    <label for="date" class="required">接送日期</label>
                    <input type="date" id="date" name="date" required>
                </div>

                <div class="form-group">
                    <label for="time" class="required">接送時間</label>
                    <div class="time-input-group">
                        <select id="hour" name="hour" required>
                            <option value="">時</option>
                        </select>
                        <select id="minute" name="minute" required>
                            <option value="">分</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" id="airportGroup" style="display: none;">
                    <label for="airport" class="required">航班編號</label>
                    <input type="text" id="airport" name="airport" placeholder="例如: CI101, BR216">
                </div>

                <div class="form-group">
                    <label for="pickup" class="required" id="pickupLabel">上車地點</label>
                    <input type="text" id="pickup" name="pickup" required>
                </div>

                <div class="form-group">
                    <label for="midstop">中停地點</label>
                    <input type="text" id="midstop" name="midstop" placeholder="如需中途停靠地點">
                </div>

                <div class="form-group">
                    <label for="dropoff" class="required" id="dropoffLabel">下車地點</label>
                    <input type="text" id="dropoff" name="dropoff" required>
                </div>

                <div class="form-group">
                    <label for="remarks">備註</label>
                    <textarea id="remarks" name="remarks" rows="3" placeholder="其他需求或特殊說明"></textarea>
                </div>

                <button type="button" class="btn btn-secondary" onclick="previousStep()">上一步</button>
                <button type="button" class="btn btn-primary" onclick="nextStep()">下一步</button>
            </div>

            <!-- 步驟4：付款與聯絡資料 -->
            <div id="step4" class="step">
                <h2 style="margin-bottom: 30px; text-align: center; color: #333;">付款與聯絡資料</h2>

                <div class="form-group">
                    <label for="payment" class="required">付款方式</label>
                    <select id="payment" name="payment" required>
                        <option value="">請選擇付款方式</option>
                        <option value="現金">現金</option>
                        <option value="簽單">簽單</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="email">電子郵件</label>
                    <input type="email" id="email" name="email">
                </div>

                <div class="form-group">
                    <label for="proxyEmail">代理信箱</label>
                    <input type="email" id="proxyEmail" name="proxyEmail">
                </div>

                <div class="form-group">
                    <label for="costCenter">成本中心</label>
                    <input type="text" id="costCenter" name="costCenter">
                </div>

                <button type="button" class="btn btn-secondary" onclick="previousStep()">上一步</button>
                <button type="button" class="btn btn-primary" onclick="showConfirmation()">預覽預約</button>
            </div>

            <!-- 步驟5：確認預約 -->
            <div id="step5" class="step">
                <h2 style="margin-bottom: 30px; text-align: center; color: #333;">確認預約資料</h2>
                
                <div class="confirmation-section">
                    <div id="confirmationDetails"></div>
                </div>

                <button type="button" class="btn btn-secondary" onclick="previousStep()">修改資料</button>
                <button type="button" class="btn btn-primary" onclick="submitBooking()">確認預約</button>
            </div>

            <!-- 提交中 -->
            <div id="submitting" class="loading">
                <h2>⏳ 正在處理您的預約...</h2>
                <p>請稍候，不要關閉頁面</p>
            </div>

            <!-- 結果顯示 -->
            <div id="result" style="display: none;"></div>
        </div>
    </div>

    <script>
        const API_URL = 'https://script.google.com/macros/s/AKfycbwvgpFcEpzkYhd4wEhx0z-spQpUOFFqjHzW_WwvIh2kHlEN958kTy0Z_ENZG4pI-BU/exec';
        let currentStep = 1;
        let selectedService = '';
        let userData = {};

        document.addEventListener('DOMContentLoaded', function() {
            initializeTimeSelects();
            setupServiceSelection();
            setupPhoneInput();
            setupPaymentChange();
            setMinDate();
            setupUppercaseInputs();
        });

        // 設定英文自動轉大寫（只有航班編號和地點欄位）
        function setupUppercaseInputs() {
            const uppercaseInputs = ['phone', 'airport', 'pickup', 'midstop', 'dropoff'];
            
            uppercaseInputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.addEventListener('input', function(e) {
                        const cursorPosition = e.target.selectionStart;
                        const oldLength = e.target.value.length;
                        e.target.value = e.target.value.toUpperCase();
                        const newLength = e.target.value.length;
                        // 保持光標位置
                        e.target.setSelectionRange(cursorPosition + (newLength - oldLength), cursorPosition + (newLength - oldLength));
                    });
                }
            });
        }

        // 設定服務選擇
        function setupServiceSelection() {
            const serviceOptions = document.querySelectorAll('.service-option');
            serviceOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // 如果點擊查詢預約，跳轉到查詢頁面
                    if (this.dataset.action === 'query') {
                        window.location.href = 'query.html';
                        return;
                    }
                    
                    serviceOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedService = this.dataset.service;
                    
                    // 自動進入下一步
                    setTimeout(() => {
                        nextStep();
                    }, 500);
                });
            });
        }

        // 初始化時間選擇器（24小時制，5分鐘間隔）
        function initializeTimeSelects() {
            const hourSelect = document.getElementById('hour');
            const minuteSelect = document.getElementById('minute');

            // 小時選項 (00-23)
            for (let i = 0; i < 24; i++) {
                const option = document.createElement('option');
                option.value = i.toString().padStart(2, '0');
                option.textContent = i.toString().padStart(2, '0');
                hourSelect.appendChild(option);
            }

            // 分鐘選項 (以5分鐘為間隔)
            for (let i = 0; i < 60; i += 5) {
                const option = document.createElement('option');
                option.value = i.toString().padStart(2, '0');
                option.textContent = i.toString().padStart(2, '0');
                minuteSelect.appendChild(option);
            }
        }

        // 設定手機號碼輸入
        function setupPhoneInput() {
            const phoneInput = document.getElementById('phone');
            phoneInput.addEventListener('input', function(e) {
                // 只允許數字
                this.value = this.value.replace(/\D/g, '');
                
                // 當輸入滿10位數字時自動查詢
                if (this.value.length === 10) {
                    lookupUserData();
                }
            });
        }

        // 查詢用戶資料
        async function lookupUserData() {
            const phone = document.getElementById('phone').value.trim();
            if (phone.length !== 10) return;

            const loadingDiv = document.getElementById('loadingUserData');
            loadingDiv.classList.add('show');

            try {
                const formData = new URLSearchParams();
                formData.append('action', 'getUserDataByPhone');
                formData.append('phone', phone);
                formData.append('serviceType', selectedService);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                
                if (result.success && result.data && Object.keys(result.data).length > 0) {
                    userData = result.data;
                    fillUserData(result.data);
                    showMessage('已自動帶入您的資料', 'success');
                }
            } catch (error) {
                console.error('查詢用戶資料失敗:', error);
                showMessage('查詢資料時發生錯誤', 'error');
            } finally {
                loadingDiv.classList.remove('show');
            }
        }

        // 填入用戶資料
        function fillUserData(data) {
            if (data.name) document.getElementById('name').value = data.name;
            if (data.company) document.getElementById('company').value = data.company;
            if (data.department) document.getElementById('department').value = data.department;
            if (data.email) document.getElementById('email').value = data.email;
            if (data.proxyEmail) document.getElementById('proxyEmail').value = data.proxyEmail;
            if (data.costCenter) document.getElementById('costCenter').value = data.costCenter;
            if (data.payment) document.getElementById('payment').value = data.payment;
            if (data.pickup) document.getElementById('pickup').value = data.pickup;
            if (data.midstop) document.getElementById('midstop').value = data.midstop;
            if (data.dropoff) document.getElementById('dropoff').value = data.dropoff;
        }

        // 設定付款方式變更事件
        function setupPaymentChange() {
            document.getElementById('payment').addEventListener('change', function() {
                const companyField = document.getElementById('company');
                if (this.value === '簽單') {
                    companyField.required = true;
                    companyField.parentElement.querySelector('label').classList.add('required');
                } else {
                    companyField.required = false;
                    companyField.parentElement.querySelector('label').classList.remove('required');
                }
            });
        }

        // 設定最小日期為今天
        function setMinDate() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date').min = today;
        }

        // 下一步
        function nextStep() {
            if (currentStep === 1) {
                if (!selectedService) {
                    showMessage('請選擇服務類型', 'error');
                    return;
                }
                updateLabels();
            } else if (!validateStep()) {
                return;
            }

            document.getElementById(`step${currentStep}`).classList.remove('active');
            currentStep++;
            document.getElementById(`step${currentStep}`).classList.add('active');

            // 顯示航班編號欄位（接機服務）
            if (currentStep === 3 && selectedService === '接機') {
                document.getElementById('airportGroup').style.display = 'block';
                document.getElementById('airport').required = true;
            }
        }

        // 上一步
        function previousStep() {
            document.getElementById(`step${currentStep}`).classList.remove('active');
            currentStep--;
            document.getElementById(`step${currentStep}`).classList.add('active');
        }

        // 更新標籤
        function updateLabels() {
            if (selectedService === '接機') {
                document.getElementById('pickupLabel').textContent = '上車地點（機場）';
                document.getElementById('dropoffLabel').textContent = '下車地點（目的地）';
            } else if (selectedService === '送機') {
                document.getElementById('pickupLabel').textContent = '上車地點（出發地）';
                document.getElementById('dropoffLabel').textContent = '下車地點（機場）';
            } else if (selectedService === '包車') {
                document.getElementById('pickupLabel').textContent = '上車地點';
                document.getElementById('dropoffLabel').textContent = '下車地點';
            }
        }

        // 驗證步驟
        function validateStep() {
            const step = document.getElementById(`step${currentStep}`);
            const requiredFields = step.querySelectorAll('[required]');
            
            for (const field of requiredFields) {
                if (!field.value.trim()) {
                    showMessage(`請填寫 ${field.parentElement.querySelector('label').textContent.replace(' *', '')}`, 'error');
                    field.focus();
                    return false;
                }
            }

            // 手機號碼格式驗證
            if (currentStep === 2) {
                const phone = document.getElementById('phone').value.trim();
                if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
                    showMessage('請輸入正確的10位手機號碼', 'error');
                    return false;
                }
            }

            // 時間選擇驗證
            if (currentStep === 3) {
                const hour = document.getElementById('hour').value;
                const minute = document.getElementById('minute').value;
                if (!hour || !minute) {
                    showMessage('請選擇完整的接送時間', 'error');
                    return false;
                }
            }

            return true;
        }

        // 顯示確認頁面
        function showConfirmation() {
            if (!validateStep()) return;

            const hour = document.getElementById('hour').value;
            const minute = document.getElementById('minute').value;
            const timeString = `${hour}:${minute}`;

            const confirmationData = [
                { label: '服務項目', value: selectedService },
                { label: '手機號碼', value: document.getElementById('phone').value },
                { label: '姓名職稱', value: document.getElementById('name').value },
                { label: '公司名稱', value: document.getElementById('company').value || '未填寫' },
                { label: '部門', value: document.getElementById('department').value || '未填寫' },
                { label: '接送日期', value: document.getElementById('date').value },
                { label: '接送時間', value: timeString },
                { label: '航班編號', value: document.getElementById('airport').value || '未填寫' },
                { label: '上車地點', value: document.getElementById('pickup').value },
                { label: '中停地點', value: document.getElementById('midstop').value || '無' },
                { label: '下車地點', value: document.getElementById('dropoff').value },
                { label: '備註', value: document.getElementById('remarks').value || '無' },
                { label: '付款方式', value: document.getElementById('payment').value },
                { label: '電子郵件', value: document.getElementById('email').value || '未填寫' },
                { label: '代理信箱', value: document.getElementById('proxyEmail').value || '未填寫' },
                { label: '成本中心', value: document.getElementById('costCenter').value || '未填寫' }
            ];

            let confirmationHTML = '';
            confirmationData.forEach(item => {
                confirmationHTML += `
                    <div class="confirmation-item">
                        <span class="confirmation-label">${item.label}</span>
                        <span class="confirmation-value">${item.value}</span>
                    </div>
                `;
            });

            document.getElementById('confirmationDetails').innerHTML = confirmationHTML;

            document.getElementById(`step${currentStep}`).classList.remove('active');
            currentStep++;
            document.getElementById(`step${currentStep}`).classList.add('active');
        }

        // 提交預約
        async function submitBooking() {
            const submittingDiv = document.getElementById('submitting');
            submittingDiv.style.display = 'block';
            document.getElementById('step5').style.display = 'none';

            try {
                const formData = new URLSearchParams();
                formData.append('action', 'createBooking');
                formData.append('服務項目', selectedService);
                formData.append('手機號碼', document.getElementById('phone').value.trim());
                formData.append('姓名職稱', document.getElementById('name').value.trim());
                formData.append('公司名稱', document.getElementById('company').value.trim());
                formData.append('部門', document.getElementById('department').value.trim());
                formData.append('接送日期', document.getElementById('date').value);
                
                const hour = document.getElementById('hour').value;
                const minute = document.getElementById('minute').value;
                formData.append('接送時間', `${hour}:${minute}`);
                
                formData.append('航班編號', document.getElementById('airport').value.trim());
                formData.append('上車點', document.getElementById('pickup').value.trim());
                formData.append('中停點', document.getElementById('midstop').value.trim());
                formData.append('下車點', document.getElementById('dropoff').value.trim());
                formData.append('備註', document.getElementById('remarks').value.trim());
                formData.append('費用支付', document.getElementById('payment').value);
                formData.append('電郵信箱', document.getElementById('email').value.trim());
                formData.append('代理信箱', document.getElementById('proxyEmail').value.trim());
                formData.append('成本中心', document.getElementById('costCenter').value.trim());

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                
                if (result.success) {
                    showResult('success', '預約成功！', '您的預約已成功建立。');
                } else {
                    showResult('error', '預約失敗', result.message || '系統發生錯誤，請稍後重試');
                }
            } catch (error) {
                console.error('提交預約失敗:', error);
                showResult('error', '提交失敗', '網路連線錯誤，請檢查網路連線後重試');
            } finally {
                submittingDiv.style.display = 'none';
            }
        }

        // 顯示訊息
        function showMessage(message, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
            messageDiv.textContent = message;
            
            const formContainer = document.querySelector('.form-container');
            formContainer.insertBefore(messageDiv, formContainer.firstChild);
            
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }

        // 顯示結果
        function showResult(type, title, message) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `
                <div class="${type === 'success' ? 'success-message' : 'error-message'}">
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px;">
                        ${type === 'success' ? '繼續新增預約' : '重新預約'}
                    </button>
                    ${type === 'success' ? '<button class="btn btn-secondary" onclick="window.location.href=\'query.html\'" style="margin-top: 10px;">查詢修改預約</button>' : ''}
                </div>
            `;
            resultDiv.style.display = 'block';
        }
    </script>
</body>
</html>
2. query.html - 查詢預約頁面
html<!-- 
檔案名稱: queryRetryTHContinueEdit2. query.html - 查詢預約頁面
html<!-- 
檔案名稱: query.html
系統名稱: Doug Shuttle Service - 預約查詢系統
修正內容: 1.修正時間顯示問題 2.過濾已過期預約 3.統一用字為"資料"
-->
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doug Shuttle Service - 預約查詢</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; color: white; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .search-section { background: #f8f9fa; padding: 25px; border-radius: 15px; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
        .form-group input { width: 100%; padding: 15px; border: 2px solid #e9ecef; border-radius: 10px; font-size: 16px; transition: border-color 0.3s ease; }
        .form-group input:focus { outline: none; border-color: #4facfe; }
        .btn { padding: 15px 30px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
        .btn-primary { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(79, 172, 254, 0.3); }
        .btn-secondary { background: #f8f9fa; color: #666; margin-left: 10px; }
        .btn-secondary:hover { background: #e9ecef; }
        .loading { display: none; text-align: center; padding: 40px; }
        .loading.show { display: block; }
        .results-section { display: none; }
        .results-section.show { display: block; }
        .booking-card { background: white; border: 2px solid #e9ecef; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .booking-card:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(0,0,0,0.15); }
        .booking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #f8f9fa; }
        .booking-number { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 10px 20px; border-radius: 25px; font-weight: 600; font-size: 16px; }
        .service-type { background: #28a745; color: white; padding: 10px 20px; border-radius: 25px; font-weight: 600; font-size: 16px; }
        .booking-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .detail-item { display: flex; align-items: center; background: #f8f9fa; padding: 15px; border-radius: 10px; min-height: 60px; }
        .detail-label { font-weight: 600; color: #495057; min-width: 100px; margin-right: 15px; font-size: 14px; }
        .detail-value { color: #212529; font-weight: 500; font-size: 16px; flex: 1; }
        .booking-actions { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; display: flex; gap: 15px; justify-content: center; }
        .no-results { text-align: center; padding: 60px 20px; color: #666; }
        .no-results h3 { margin-bottom: 15px; color: #495057; }
        .success-message, .error-message { padding: 15px 20px; border-radius: 10px; margin-bottom: 20px; text-align: center; }
        .success-message { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error-message { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        @media (max-width: 768px) {
            .container { margin: 0; border-radius: 0; }
            .content { padding: 20px; }
            .booking-details { grid-template-columns: 1fr; }
            .booking-header { flex-direction: column; gap: 10px; }
            .booking-actions { flex-direction: column; }
            .btn { width: 100%; margin: 5px 0; }
            .detail-item { flex-direction: column; align-items: flex-start; gap: 8px; }
            .detail-label { min-width: auto; margin-right: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Doug Shuttle Service</h1>
            <p>預約查詢系統</p>
        </div>

        <div class="content">
            <div class="search-section">
                <div class="form-group">
                    <label for="phone">手機號碼</label>
                    <input type="tel" id="phone" maxlength="10">
                </div>
                <button class="btn btn-primary" onclick="searchBookings()">查詢預約</button>
                <button class="btn btn-secondary" onclick="window.location.href='index.html'">新增預約</button>
            </div>

            <div id="loading" class="loading">
                <h3>🔍 正在查詢您的預約記錄...</h3>
                <p>請稍候，不要關閉頁面</p>
            </div>

            <div id="results" class="results-section">
                <div id="resultsContent"></div>
            </div>

            <!-- 修改預約表單 -->
            <div id="editModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <h3 style="margin-bottom: 20px; text-align: center;">修改預約資料</h3>
                    
                    <div class="form-group">
                        <label for="editName">姓名職稱</label>
                        <input type="text" id="editName">
                    </div>
                    
                    <div class="form-group">
                        <label for="editCompany">公司名稱</label>
                        <input type="text" id="editCompany">
                    </div>
                    
                    <div class="form-group">
                        <label for="editDepartment">部門</label>
                        <input type="text" id="editDepartment">
                    </div>
                    
                    <div class="form-group">
                        <label for="editDate">接送日期</label>
                        <input type="date" id="editDate">
                    </div>
                    
                    <div class="form-group">
                        <label for="editTime">接送時間</label>
                        <input type="time" id="editTime">
                    </div>
                    
                    <div class="form-group">
                        <label for="editAirport">航班編號</label>
                        <input type="text" id="editAirport" placeholder="如適用">
                    </div>
                    
                    <div class="form-group">
                        <label for="editPickup">上車地點</label>
                        <input type="text" id="editPickup">
                    </div>
                    
                    <div class="form-group">
                        <label for="editMidstop">中停地點</label>
                        <input type="text" id="editMidstop" placeholder="如需要">
                    </div>
                    
                    <div class="form-group">
                        <label for="editDropoff">下車地點</label>
                        <input type="text" id="editDropoff">
                    </div>
                    
                    <div class="form-group">
                        <label for="editRemarks">備註</label>
                        <textarea id="editRemarks" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="editPayment">付款方式</label>
                        <select id="editPayment">
                            <option value="現金">現金</option>
                            <option value="簽單">簽單</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editEmail">電子郵件</label>
                        <input type="email" id="editEmail">
                    </div>
                    
                    <div class="form-group">
                        <label for="editProxyEmail">代理信箱</label>
                        <input type="email" id="editProxyEmail">
                    </div>
                    
                    <div class="form-group">
                        <label for="editCostCenter">成本中心</label>
                        <input type="text" id="editCostCenter">
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-primary" onclick="saveBookingChanges()" style="flex: 1;">儲存修改</button>
                        <button class="btn btn-secondary" onclick="closeEditModal()" style="flex: 1;">取消</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const API_URL = 'https://script.google.com/macros/s/AKfycbwvgpFcEpzkYhd4wEhx0z-spQpUOFFqjHzW_WwvIh2kHlEN958kTy0Z_ENZG4pI-BU/exec';
        let currentEditingBookingId = null;

        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('phone').addEventListener('input', function(e) {
                this.value = this.value.replace(/\D/g, '');
                if (this.value.length === 10) {
                    searchBookings();
                }
            });
            setupUppercaseInputs();
        });

        // 設定英文自動轉大寫（只有航班編號和地點欄位）
        function setupUppercaseInputs() {
            const uppercaseInputs = ['editAirport', 'editPickup', 'editMidstop', 'editDropoff'];
            
            uppercaseInputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.addEventListener('input', function(e) {
                        const cursorPosition = e.target.selectionStart;
                        const oldLength = e.target.value.length;
                        e.target.value = e.target.value.toUpperCase();
                        const newLength = e.target.value.length;
                        // 保持光標位置
                        e.target.setSelectionRange(cursorPosition + (newLength - oldLength), cursorPosition + (newLength - oldLength));
                    });
                }
            });
        }

        async function searchBookings() {
            const phone = document.getElementById('phone').value.trim();
            
            if (!phone) {
                showMessage('請輸入手機號碼', 'error');
                return;
            }

            if (phone.length !== 10) {
                showMessage('請輸入正確的10位手機號碼', 'error');
                return;
            }

            const loading = document.getElementById('loading');
            const results = document.getElementById('results');
            
            loading.classList.add('show');
            results.classList.remove('show');

            try {
                const formData = new URLSearchParams();
                formData.append('action', 'getBookingsByPhone');
                formData.append('phone', phone);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                
                if (result.success) {
                    // 過濾未到期的預約
                    const validBookings = filterValidBookings(result.data);
                    displayResults(validBookings);
                    results.classList.add('show');
                } else {
                    showMessage(result.message || '查詢失敗', 'error');
                }
            } catch (error) {
                console.error('查詢預約失敗:', error);
                showMessage('網路連線錯誤，請檢查網路連線後重試', 'error');
            } finally {
                loading.classList.remove('show');
            }
        }

        // 過濾未到期的預約
        function filterValidBookings(bookings) {
            if (!bookings || bookings.length === 0) return [];
            
            const now = new Date();
            return bookings.filter(booking => {
                try {
                    // 解析日期和時間
                    const [year, month, day] = booking.date.split('/');
                    const [hour, minute] = booking.time.split(':');
                    
                    // 建立預約日期時間物件
                    const bookingDateTime = new Date(
                        parseInt(year), 
                        parseInt(month) - 1, 
                        parseInt(day), 
                        parseInt(hour), 
                        parseInt(minute)
                    );
                    
                    // 只返回未到期的預約（預約時間大於當前時間）
                    return bookingDateTime > now;
                } catch (error) {
                    console.error('日期解析錯誤:', error, booking);
                    // 如果解析失敗，保留該預約
                    return true;
                }
            });
        }

        function displayResults(bookings) {
            const resultsContent = document.getElementById('resultsContent');
            
            if (!bookings || bookings.length === 0) {
                resultsContent.innerHTML = `
                    <div class="no-results">
                        <h3>未找到有效預約記錄</h3>
                        <p>此手機號碼沒有未到期的預約記錄</p>
                        <button class="btn btn-primary" onclick="window.location.href='index.html'" style="margin-top: 20px;">
                            立即預約
                        </button>
                    </div>
                `;
                return;
            }

            let html = `<h2 style="margin-bottom: 25px; color: #333; text-align: center;">找到 ${bookings.length} 筆有效預約記錄</h2>`;
            
            bookings.forEach(booking => {
                // 確保時間格式正確顯示
                let displayTime = booking.time || '未設定';
                if (displayTime && displayTime !== '未設定') {
                    // 確保時間格式為 HH:MM
                    const timeParts = displayTime.split(':');
                    if (timeParts.length === 2) {
                        displayTime = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
                    }
                }

                html += `
                    <div class="booking-card">
                        <div class="booking-header">
                            <div class="booking-number">預約 ${booking.序號}</div>
                            <div class="service-type">${booking.service}</div>
                        </div>

                        <div class="booking-details">
                            <div class="detail-item">
                                <span class="detail-label">姓名職稱</span>
                                <span class="detail-value">${booking.name}</span>
                            </div>

                            <div class="detail-item">
                                <span class="detail-label">接送日期</span>
                                <span class="detail-value">${booking.date}</span>
                            </div>

                            <div class="detail-item">
                                <span class="detail-label">接送時間</span>
                                <span class="detail-value">${displayTime}</span>
                            </div>

                            ${booking.company ? `
                            <div class="detail-item">
                                <span class="detail-label">公司</span>
                                <span class="detail-value">${booking.company}</span>
                            </div>
                            ` : ''}

                            ${booking.airport ? `
                            <div class="detail-item">
                                <span class="detail-label">航班編號</span>
                                <span class="detail-value">${booking.airport}</span>
                            </div>
                            ` : ''}

                            <div class="detail-item">
                                <span class="detail-label">上車地點</span>
                                <span class="detail-value">${booking.pickup}</span>
                            </div>

                            ${booking.midstop ? `
                            <div class="detail-item">
                                <span class="detail-label">中停地點</span>
                                <span class="detail-value">${booking.midstop}</span>
                            </div>
                            ` : ''}

                            <div class="detail-item">
                                <span class="detail-label">下車地點</span>
                                <span class="detail-value">${booking.dropoff}</span>
                            </div>

                            <div class="detail-item">
                                <span class="detail-label">付款方式</span>
                                <span class="detail-value">${booking.payment}</span>
                            </div>

                            ${booking.remarks ? `
                            <div class="detail-item">
                                <span class="detail-label">備註</span>
                                <span class="detail-value">${booking.remarks}</span>
                            </div>
                            ` : ''}
                        </div>

                        <div class="booking-actions">
                            <button class="btn btn-secondary" onclick="editBooking(${booking.rowIndex})">修改預約</button>
                            <button class="btn btn-primary" onclick="cancelBooking(${booking.rowIndex})" style="background: #dc3545;">取消預約</button>
                        </div>
                    </div>
                `;
            });

            resultsContent.innerHTML = html;
        }

        async function editBooking(bookingId) {
            try {
                currentEditingBookingId = bookingId;
                
                // 從當前顯示的預約列表中找到對應的資料
                const bookingCards = document.querySelectorAll('.booking-card');
                let bookingData = null;
                
                bookingCards.forEach(card => {
                    const editBtn = card.querySelector(`button[onclick*="editBooking(${bookingId})"]`);
                    if (editBtn) {
                        const detailItems = card.querySelectorAll('.detail-item');
                        const getValue = (label) => {
                            for (let item of detailItems) {
                                if (item.querySelector('.detail-label').textContent.includes(label)) {
                                    return item.querySelector('.detail-value').textContent;
                                }
                            }
                            return '';
                        };
                        
                        bookingData = {
                            name: getValue('姓名職稱'),
                            company: getValue('公司'),
                            department: getValue('部門') || '',
                            date: getValue('接送日期'),
                            time: getValue('接送時間'),
                            airport: getValue('航班編號'),
                            pickup: getValue('上車地點'),
                            midstop: getValue('中停地點'),
                            dropoff: getValue('下車地點'),
                            remarks: getValue('備註'),
                            payment: getValue('付款方式'),
                            email: getValue('電子郵件') || '',
                            proxyEmail: getValue('代理信箱') || '',
                            costCenter: getValue('成本中心') || ''
                        };
                    }
                });
                
                if (bookingData) {
                    // 轉換日期格式 yyyy/mm/dd 到 yyyy-mm-dd
                    const dateParts = bookingData.date.split('/');
                    const formattedDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
                    
                    // 填入表單
                    document.getElementById('editName').value = bookingData.name || '';
                    document.getElementById('editCompany').value = bookingData.company || '';
                    document.getElementById('editDepartment').value = bookingData.department || '';
                    document.getElementById('editDate').value = formattedDate;
                    document.getElementById('editTime').value = bookingData.time !== '未設定' ? bookingData.time : '';
                    document.getElementById('editAirport').value = bookingData.airport || '';
                    document.getElementById('editPickup').value = bookingData.pickup || '';
                    document.getElementById('editMidstop').value = bookingData.midstop || '';
                    document.getElementById('editDropoff').value = bookingData.dropoff || '';
                    document.getElementById('editRemarks').value = bookingData.remarks || '';
                    document.getElementById('editPayment').value = bookingData.payment || '現金';
                    document.getElementById('editEmail').value = bookingData.email || '';
                    document.getElementById('editProxyEmail').value = bookingData.proxyEmail || '';
                    document.getElementById('editCostCenter').value = bookingData.costCenter || '';
                    
                    // 顯示修改表單
                    document.getElementById('editModal').style.display = 'block';
                } else {
                    showMessage('無法載入預約資料', 'error');
                }
            } catch (error) {
                console.error('載入預約資料失敗:', error);
                showMessage('載入預約資料失敗', 'error');
            }
        }

        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
            currentEditingBookingId = null;
        }

        async function saveBookingChanges() {
            if (!currentEditingBookingId) {
                showMessage('無效的預約ID', 'error');
                return;
            }

            const editDate = document.getElementById('editDate').value;
            const editTime = document.getElementById('editTime').value;
            const editName = document.getElementById('editName').value.trim();

            if (!editDate || !editTime || !editName) {
                showMessage('請填寫必要欄位：姓名職稱、接送日期和時間', 'error');
                return;
            }

            try {
                const formData = new URLSearchParams();
                formData.append('action', 'updateBooking');
                formData.append('bookingId', currentEditingBookingId);
                formData.append('姓名職稱', editName);
                formData.append('公司名稱', document.getElementById('editCompany').value.trim());
                formData.append('部門', document.getElementById('editDepartment').value.trim());
                formData.append('接送日期', editDate);
                formData.append('接送時間', editTime);
                formData.append('航班編號', document.getElementById('editAirport').value.trim());
                formData.append('上車點', document.getElementById('editPickup').value.trim());
                formData.append('中停點', document.getElementById('editMidstop').value.trim());
                formData.append('下車點', document.getElementById('editDropoff').value.trim());
                formData.append('備註', document.getElementById('editRemarks').value.trim());
                formData.append('費用支付', document.getElementById('editPayment').value);
                formData.append('電郵信箱', document.getElementById('editEmail').value.trim());
                formData.append('代理信箱', document.getElementById('editProxyEmail').value.trim());
                formData.append('成本中心', document.getElementById('editCostCenter').value.trim());

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                
                if (result.success) {
                    showMessage('預約修改成功', 'success');
                    closeEditModal();
                    setTimeout(() => searchBookings(), 1500);
                } else {
                    showMessage(result.message || '修改失敗', 'error');
                }
            } catch (error) {
                console.error('修改預約失敗:', error);
                showMessage('網路連線錯誤，請重試', 'error');
            }
        }

        async function cancelBooking(bookingId) {
            if (!confirm('確定要取消此預約嗎？此操作無法復原。')) return;

            try {
                const formData = new URLSearchParams();
                formData.append('action', 'cancelBooking');
                formData.append('bookingId', bookingId);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                
                if (result.success) {
                    showMessage('預約已成功取消', 'success');
                    setTimeout(() => searchBookings(), 1500);
                } else {
                    showMessage(result.message || '取消失敗', 'error');
                }
            } catch (error) {
                console.error('取消預約失敗:', error);
                showMessage('網路連線錯誤，請重試', 'error');
            }
        }

        function showMessage(message, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
            messageDiv.textContent = message;
            const content = document.querySelector('.content');
            content.insertBefore(messageDiv, content.firstChild);
            setTimeout(() => messageDiv.remove(), 5000);
        }
    </script>
</body>
</html>
3. Code.gs - Google Apps Script 後端程式
javascript/**
 * 檔案名稱: Code.gs
 * 系統名稱: Doug Shuttle Service - Google Apps Script 後端系統
 * 版本: v9.3 Final | 2025-09-23
 * 
 * 修正內容:
 * - 修正 formatTime 函數處理時間格式問題
 * - 查詢結果過濾已過期預約
 * - 統一使用"資料"用字
 */

const SPREADSHEET_ID = '1J8wuDVtj2U54O-6VGXmGz1x3JGld4cWYiyYN5bED1gQ';
const SHEET_NAME = 'Sheet1';

function oneTimeAuthSetup() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }
    
    const testCell = sheet.getRange('Z1');
    testCell.setValue('test_' + Date.now());
    testCell.setValue('');
    
    if (sheet.getLastRow() === 0) {
      const headers = [
        '服務項目', '公司名稱', '部門', '手機號碼', '姓名職稱', 
        '接送日期', '接送時間', '航班編號', '上車點', '中停點', 
        '下車點', '備註', '費用支付', '提交時間', '狀態',
        '電郵信箱', '代理信箱', '成本中心', '金額', '資料異動追蹤', 'LINE_USER_ID'
      ];
      sheet.getRange(1, 1, 1, 21).setValues([headers]);
      sheet.getRange(1, 4, sheet.getMaxRows(), 1).setNumberFormat('@');
    }
    
    return { success: trueRetryTHContinueEdit3. Code.gs - Google Apps Script 後端程式 (續)
javascript    return { success: true, message: '授權完成' };
  } catch (error) {
    console.error('權限授權失敗:', error.message);
    throw error;
  }
}

function doPost(e) {
  try {
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
        return createResponse(true, 'API 正常運作', { version: 'v9.3' });
      default:
        return createResponse(false, '未知操作: ' + action);
    }
  } catch (error) {
    console.log('API錯誤: ' + error.message);
    return createResponse(false, '系統錯誤: ' + error.message);
  }
}

function doGet(e) { return doPost(e); }

function createBooking(params) {
  try {
    const required = ['服務項目', '姓名職稱', '手機號碼', '接送日期', '接送時間', '上車點', '下車點', '費用支付'];
    for (const field of required) {
      if (!params[field] || !params[field].trim()) {
        return createResponse(false, '缺少必要欄位: ' + field);
      }
    }
    
    const phone = normalizePhone(params['手機號碼']);
    if (!phone || phone.length !== 10) {
      return createResponse(false, '手機號碼格式不正確');
    }
    
    if (params['服務項目'] === '接機' && !params['航班編號']) {
      return createResponse(false, '接機服務需要航班編號');
    }
    
    if (params['費用支付'] === '簽單' && !params['公司名稱']) {
      return createResponse(false, '簽單付款需要公司名稱');
    }
    
    const rowData = [
      params['服務項目'] || '', params['公司名稱'] || '', params['部門'] || '', phone, params['姓名職稱'] || '',
      params['接送日期'] || '', params['接送時間'] || '', params['航班編號'] || '',
      params['上車點'] || '', params['中停點'] || '', params['下車點'] || '', params['備註'] || '',
      params['費用支付'] || '', formatDateTime(new Date()), 'active',
      params['電郵信箱'] || '', params['代理信箱'] || '', params['成本中心'] || '',
      params['金額'] || '', '建立預約', params['lineUserId'] || ''
    ];
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow(rowData);
    sheet.getRange(sheet.getLastRow(), 4).setNumberFormat('@');
    
    const userData = {
      name: params['姓名職稱'] || '',
      company: params['公司名稱'] || '',
      department: params['部門'] || '',
      email: params['電郵信箱'] || '',
      proxyEmail: params['代理信箱'] || '',
      costCenter: params['成本中心'] || '',
      payment: params['費用支付'] || '',
      pickup: params['上車點'] || '',
      midstop: params['中停點'] || '',
      dropoff: params['下車點'] || ''
    };
    PropertiesService.getScriptProperties().setProperty('user_' + phone, JSON.stringify(userData));
    
    return createResponse(true, '預約建立成功', { 
      message: '您的預約已成功建立'
    });
    
  } catch (error) {
    return createResponse(false, '建立失敗: ' + error.message);
  }
}

function getUserDataByPhone(params) {
  try {
    const phone = normalizePhone(params.phone);
    if (!phone || phone.length !== 10) {
      return createResponse(false, '手機號碼格式不正確');
    }
    
    const cached = PropertiesService.getScriptProperties().getProperty('user_' + phone);
    if (cached) {
      const cachedData = JSON.parse(cached);
      return createResponse(true, '查詢成功', adjustLocationsByService(cachedData, params.serviceType));
    }
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return createResponse(true, '查詢成功', {});
    }
    
    const phoneData = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
    
    for (let i = 0; i < phoneData.length; i++) {
      if (normalizePhone(phoneData[i][0]) === phone) {
        const rowData = sheet.getRange(i + 2, 1, 1, 21).getValues()[0];
        const userData = {
          name: rowData[4] || '',
          company: rowData[1] || '',
          department: rowData[2] || '',
          email: rowData[15] || '',
          proxyEmail: rowData[16] || '',
          costCenter: rowData[17] || '',
          payment: rowData[12] || '',
          pickup: rowData[8] || '',
          midstop: rowData[9] || '',
          dropoff: rowData[10] || '',
          amount: rowData[18] || ''
        };
        
        PropertiesService.getScriptProperties().setProperty('user_' + phone, JSON.stringify(userData));
        
        return createResponse(true, '查詢成功', adjustLocationsByService(userData, params.serviceType));
      }
    }
    
    return createResponse(true, '查詢成功', {});
    
  } catch (error) {
    return createResponse(false, '查詢失敗: ' + error.message);
  }
}

function adjustLocationsByService(userData, serviceType) {
  if (!userData || !serviceType) return userData;
  
  const adjustedData = { ...userData };
  
  if (serviceType === '接機' && userData.pickup && userData.dropoff) {
    if (!userData.pickup.includes('機場') && userData.dropoff.includes('機場')) {
      adjustedData.pickup = userData.dropoff;
      adjustedData.dropoff = userData.pickup;
    }
  } else if (serviceType === '送機' && userData.pickup && userData.dropoff) {
    if (userData.pickup.includes('機場') && !userData.dropoff.includes('機場')) {
      adjustedData.pickup = userData.dropoff;
      adjustedData.dropoff = userData.pickup;
    }
  }
  
  return adjustedData;
}

function getBookingsByPhone(params) {
  try {
    const phone = normalizePhone(params.phone);
    if (!phone || phone.length !== 10) {
      return createResponse(false, '手機號碼格式不正確');
    }
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return createResponse(true, '查詢成功', []);
    }
    
    const allData = sheet.getRange(2, 1, lastRow - 1, 21).getValues();
    const bookings = [];
    const now = new Date();
    
    allData.forEach((row, index) => {
      if (normalizePhone(row[3]) === phone && row[14] === 'active') {
        // 檢查是否已過期
        try {
          const bookingDate = parseBookingDate(row[5]);
          const bookingTime = parseBookingTime(row[6]);
          
          if (bookingDate && bookingTime) {
            const [hour, minute] = bookingTime.split(':');
            const bookingDateTime = new Date(bookingDate);
            bookingDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
            
            // 只顯示未到期的預約
            if (bookingDateTime > now) {
              bookings.push({
                rowIndex: index + 2,
                service: row[0], 
                company: row[1], 
                name: row[4],
                date: formatDate(bookingDate), 
                time: bookingTime, 
                airport: row[7],
                pickup: row[8], 
                midstop: row[9], 
                dropoff: row[10], 
                remarks: row[11],
                payment: row[12], 
                status: row[14],
                sortDateTime: bookingDateTime.toISOString()
              });
            }
          }
        } catch (error) {
          console.error('日期時間解析錯誤:', error, row[5], row[6]);
          // 如果解析失敗，仍然包含該預約
          bookings.push({
            rowIndex: index + 2,
            service: row[0], 
            company: row[1], 
            name: row[4],
            date: formatDate(row[5]), 
            time: formatTime(row[6]), 
            airport: row[7],
            pickup: row[8], 
            midstop: row[9], 
            dropoff: row[10], 
            remarks: row[11],
            payment: row[12], 
            status: row[14],
            sortDateTime: new Date().toISOString()
          });
        }
      }
    });
    
    bookings.sort((a, b) => new Date(a.sortDateTime) - new Date(b.sortDateTime));
    
    const numberedBookings = bookings.map((booking, index) => {
      const { sortDateTime, ...bookingWithoutSort } = booking;
      return {
        序號: index + 1,
        ...bookingWithoutSort
      };
    });
    
    return createResponse(true, '查詢成功', numberedBookings);
    
  } catch (error) {
    return createResponse(false, '查詢失敗: ' + error.message);
  }
}

function parseBookingDate(dateValue) {
  if (!dateValue) return null;
  try {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    return new Date(dateValue);
  } catch (error) {
    return null;
  }
}

function parseBookingTime(timeValue) {
  if (!timeValue) return null;
  try {
    let timeStr = timeValue.toString();
    
    // 處理各種時間格式
    if (timeValue instanceof Date) {
      const hours = timeValue.getHours().toString().padStart(2, '0');
      const minutes = timeValue.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // 處理 "HH:MM" 格式
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0]).toString().padStart(2, '0');
        const minute = parseInt(parts[1]).toString().padStart(2, '0');
        return `${hour}:${minute}`;
      }
    }
    
    // 處理純數字格式 (如 1030 表示 10:30)
    if (/^\d{3,4}$/.test(timeStr)) {
      if (timeStr.length === 3) {
        return `0${timeStr[0]}:${timeStr.substring(1)}`;
      } else {
        return `${timeStr.substring(0, 2)}:${timeStr.substring(2)}`;
      }
    }
    
    return timeStr;
  } catch (error) {
    console.error('時間解析錯誤:', error, timeValue);
    return null;
  }
}

function updateBooking(params) {
  try {
    const bookingId = parseInt(params.bookingId);
    if (!bookingId || bookingId < 2) {
      return createResponse(false, '無效預約ID');
    }
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (bookingId > sheet.getLastRow()) {
      return createResponse(false, '找不到預約記錄');
    }
    
    const data = sheet.getRange(bookingId, 1, 1, 21).getValues()[0];
    
    // 更新所有可修改的欄位
    if (params['公司名稱']) data[1] = params['公司名稱'];
    if (params['部門']) data[2] = params['部門'];
    if (params['姓名職稱']) data[4] = params['姓名職稱'];
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
    if (params['成本中心']) data[17] = params['成本中心'];
    
    data[19] = (data[19] || '') + ' | ' + formatDateTime(new Date()) + ': 修改預約';
    
    sheet.getRange(bookingId, 1, 1, 21).setValues([data]);
    return createResponse(true, '修改成功');
    
  } catch (error) {
    return createResponse(false, '修改失敗: ' + error.message);
  }
}

function cancelBooking(params) {
  try {
    const bookingId = parseInt(params.bookingId);
    if (!bookingId || bookingId < 2) {
      return createResponse(false, '無效預約ID');
    }
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (bookingId > sheet.getLastRow()) {
      return createResponse(false, '找不到預約記錄');
    }
    
    const data = sheet.getRange(bookingId, 1, 1, 21).getValues()[0];
    data[14] = 'cancelled';
    data[19] = (data[19] || '') + ' | ' + formatDateTime(new Date()) + ': 取消預約';
    
    sheet.getRange(bookingId, 1, 1, 21).setValues([data]);
    return createResponse(true, '取消成功');
    
  } catch (error) {
    return createResponse(false, '取消失敗: ' + error.message);
  }
}

function parseParameters(e) {
  let params = {};
  if (e.postData && e.postData.contents) {
    e.postData.contents.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value !== undefined) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
  }
  if (e.parameter) Object.assign(params, e.parameter);
  return params;
}

function normalizePhone(input) {
  if (!input) return '';
  let digits = input.toString().replace(/\D/g, '');
  if (digits.startsWith('886')) digits = '0' + digits.substring(3);
  return (digits.length === 10 && digits.startsWith('0')) ? digits : '';
}

function formatDate(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '/' + 
           String(d.getMonth() + 1).padStart(2, '0') + '/' + 
           String(d.getDate()).padStart(2, '0');
  } catch { return ''; }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    return parseBookingTime(timeStr) || '';
  } catch { return ''; }
}

function formatDateTime(date) {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.getFullYear() + '/' + 
           String(d.getMonth() + 1).padStart(2, '0') + '/' + 
           String(d.getDate()).padStart(2, '0') + ' ' +
           String(d.getHours()).padStart(2, '0') + ':' + 
           String(d.getMinutes()).padStart(2, '0') + ':' + 
           String(d.getSeconds()).padStart(2, '0');
  } catch { return ''; }
}

function createResponse(success, message, data = null) {
  const response = { success, message, timestamp: new Date().toISOString() };
  if (data !== null) response.data = data;
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
開發紀要
系統功能

服務類型選擇：送機、接機、包車、查詢預約
多步驟預約流程：基本資料 → 接送資料 → 付款聯絡資料 → 確認預約
智能資料填充：手機號碼自動查詢歷史資料
完整CRUD功能：建立、查詢、修改、取消預約
資料驗證：必填欄位、格式檢查、業務規則驗證
時間過濾：只顯示未過期的預約記錄

技術特色

前後端分離：HTML/JavaScript + Google Apps Script
RESTful API：統一的API介面處理所有操作
響應式設計：支援手機和桌面瀏覽器
資料快取：PropertiesService快取用戶資料
自動格式化：英文自動轉大寫（特定欄位）
錯誤處理：完整的前後端錯誤處理機制

主要設定

API URL：https://script.google.com/macros/s/AKfycbwvgpFcEpzkYhd4wEhx0z-spQpUOFFqjHzW_WwvIh2kHlEN958kTy0Z_ENZG4pI-BU/exec
試算表ID：1J8wuDVtj2U54O-6VGXmGz1x3JGld4cWYiyYN5bED1gQ
工作表名稱：Sheet1
付款方式：現金、簽單
自動轉大寫欄位：手機號碼、航班編號、地點欄位

資料庫結構
Google Sheets 欄位 (21欄)：

服務項目 2. 公司名稱 3. 部門 4. 手機號碼 5. 姓名職稱
接送日期 7. 接送時間 8. 航班編號 9. 上車點 10. 中停點
下車點 12. 備註 13. 費用支付 14. 提交時間 15. 狀態
電郵信箱 17. 代理信箱 18. 成本中心 19. 金額 20. 資料異動追蹤 21. LINE_USER_ID

部署說明

在 Google Apps Script 建立新專案
貼上 Code.gs 程式碼
執行 oneTimeAuthSetup() 進行初始化
部署為網路應用程式
將 API URL 更新到前端檔案
上傳 index.html 和 query.html 到網頁伺服器
