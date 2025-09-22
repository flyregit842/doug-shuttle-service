<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doug Shuttle Service - 預約查詢</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 16px;
        }

        .content {
            padding: 30px;
        }

        .search-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        .form-group input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus {
            outline: none;
            border-color: #4facfe;
        }

        .btn {
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(79, 172, 254, 0.3);
        }

        .btn-secondary {
            background: #f8f9fa;
            color: #666;
            margin-left: 10px;
        }

        .btn-secondary:hover {
            background: #e9ecef;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 40px;
        }

        .loading.show {
            display: block;
        }

        .results-section {
            display: none;
        }

        .results-section.show {
            display: block;
        }

        .booking-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }

        .booking-card:hover {
            transform: translateY(-5px);
        }

        .booking-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e9ecef;
        }

        .booking-number {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }

        .service-type {
            background: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }

        .booking-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .detail-group {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
        }

        .detail-group h4 {
            color: #495057;
            margin-bottom: 10px;
            font-size: 14px;
        }

        .detail-group p {
            color: #212529;
            font-weight: 600;
            font-size: 16px;
        }

        .booking-actions {
            margin-top: 20px;
            text-align: right;
        }

        .no-results {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }

        .no-results h3 {
            margin-bottom: 15px;
            color: #495057;
        }

        .success-message, .error-message {
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }

        .success-message {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .error-message {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .search-hint {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            color: #0277bd;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 14px;
        }

        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .content {
                padding: 20px;
            }

            .booking-details {
                grid-template-columns: 1fr;
            }

            .booking-header {
                flex-direction: column;
                gap: 10px;
            }

            .booking-actions {
                text-align: center;
            }

            .btn {
                width: 100%;
                margin: 5px 0;
            }
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
                <div class="search-hint">
                    💡 請輸入您的手機號碼來查詢預約記錄。支援多種格式：0912345678、0912-345-678、+886912345678
                </div>
                
                <div class="form-group">
                    <label for="phone">手機號碼</label>
                    <input type="tel" id="phone" placeholder="請輸入手機號碼" maxlength="20">
                </div>

                <button class="btn btn-primary" onclick="searchBookings()">查詢預約</button>
                <button class="btn btn-secondary" onclick="window.open('index.html', '_blank')">新增預約</button>
            </div>

            <div id="loading" class="loading">
                <h3>🔍 正在查詢您的預約記錄...</h3>
                <p>請稍候，不要關閉頁面</p>
            </div>

            <div id="results" class="results-section">
                <div id="resultsContent"></div>
            </div>
        </div>
    </div>

    <script>
        const API_URL = 'https://script.google.com/macros/s/AKfycbwvgpFcEpzkYhd4wEhx0z-spQpUOFFqjHzW_WwvIh2kHlEN958kTy0Z_ENZG4pI-BU/exec';

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('phone').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchBookings();
                }
            });
        });

        // 查詢預約
        async function searchBookings() {
            const phone = document.getElementById('phone').value.trim();
            
            if (!phone) {
                showMessage('請輸入手機號碼', 'error');
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
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                
                if (result.success) {
                    displayResults(result.data);
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

        // 顯示查詢結果
        function displayResults(bookings) {
            const resultsContent = document.getElementById('resultsContent');
            
            if (!bookings || bookings.length === 0) {
                resultsContent.innerHTML = `
                    <div class="no-results">
                        <h3>未找到預約記錄</h3>
                        <p>此手機號碼沒有相關的預約記錄</p>
                        <button class="btn btn-primary" onclick="window.open('index.html', '_blank')" style="margin-top: 20px;">
                            立即預約
                        </button>
                    </div>
                `;
                return;
            }

            let html = `<h2 style="margin-bottom: 25px; color: #333;">找到 ${bookings.length} 筆預約記錄</h2>`;
            
            bookings.forEach(booking => {
                html += `
                    <div class="booking-card">
                        <div class="booking-header">
                            <div class="booking-number">預約 ${booking.序號}</div>
                            <div class="service-type">${booking.service}</div>
                        </div>

                        <div class="booking-details">
                            <div class="detail-group">
                                <h4>預約人資訊</h4>
                                <p>${booking.name}</p>
                                ${booking.company ? `<p style="font-size: 14px; color: #666; margin-top: 5px;">${booking.company}</p>` : ''}
                            </div>

                            <div class="detail-group">
                                <h4>接送時間</h4>
                                <p>${booking.date}</p>
                                <p style="font-size: 14px; color: #666; margin-top: 5px;">${booking.time}</p>
                            </div>

                            <div class="detail-group">
                                <h4>路線資訊</h4>
                                <p>${booking.pickup} → ${booking.dropoff}</p>
                                ${booking.midstop ? `<p style="font-size: 14px; color: #666; margin-top: 5px;">中停：${booking.midstop}</p>` : ''}
                            </div>

                            ${booking.airport ? `
                            <div class="detail-group">
                                <h4>航班編號</h4>
                                <p>${booking.airport}</p>
                            </div>
                            ` : ''}

                            <div class="detail-group">
                                <h4>付款方式</h4>
                                <p>${booking.payment}</p>
                            </div>

                            ${booking.remarks ? `
                            <div class="detail-group">
                                <h4>備註</h4>
                                <p style="font-size: 14px;">${booking.remarks}</p>
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

        // 修改預約
        async function editBooking(bookingId) {
            if (!confirm('確定要修改此預約嗎？')) return;

            // 這裡可以實作修改功能，暫時顯示訊息
            showMessage('修改功能開發中，如需修改請聯繫客服', 'error');
        }

        // 取消預約
        async function cancelBooking(bookingId) {
            if (!confirm('確定要取消此預約嗎？此操作無法復原。')) return;

            try {
                const formData = new URLSearchParams();
                formData.append('action', 'cancelBooking');
                formData.append('bookingId', bookingId);

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
                    showMessage('預約已成功取消', 'success');
                    // 重新查詢以更新顯示
                    setTimeout(() => {
                        searchBookings();
                    }, 1500);
                } else {
                    showMessage(result.message || '取消失敗', 'error');
                }
            } catch (error) {
                console.error('取消預約失敗:', error);
                showMessage('網路連線錯誤，請重試', 'error');
            }
        }

        // 顯示訊息
        function showMessage(message, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
            messageDiv.textContent = message;
            
            const content = document.querySelector('.content');
            content.insertBefore(messageDiv, content.firstChild);
            
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    </script>
</body>
</html>