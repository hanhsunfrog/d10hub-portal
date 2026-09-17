/* =========================================================
   KẾT NỐI DỮ LIỆU GOOGLE SHEETS & XỬ LÝ GIAO DIỆN (JSONP BẢN FIX LỖI CORS)
   ========================================================= */

// URL của Apps Script (Đảm bảo đuôi url KHÔNG có callback)
const API_URL = 'https://script.google.com/macros/s/AKfycbzogD2eCZPfidJ3WZLx56lZzzPcUAUyASyiUyWiYH8QzhGFDTj7BgQFoP1A-aMBwmOmIA/exec';
let allDocuments = [];

// Hàm xử lý dữ liệu trả về từ JSONP
window.handleJsonpResponse = function(data) {
    allDocuments = data;
    
    const countDisplayElement = document.querySelector("p[aria-live='polite']");
    if (countDisplayElement) {
         countDisplayElement.innerHTML = `Hiển thị <span class="font-bold text-brand-red">${allDocuments.length}</span> tài liệu bám sát chương trình`;
    }
    
    hienThiTaiLieu(allDocuments);
};

// Hàm tải dữ liệu dùng phương pháp JSONP để tránh lỗi CORS
function fetchKhoHocLieu() {
    const container = document.getElementById("data-container");
    if (container) {
        container.innerHTML = `<div style="text-align: center; padding: 20px; font-weight: bold; color: var(--primary-color);">Đang tải dữ liệu từ kho Google Drive...</div>`;
    }

    // Tạo thẻ script động để kéo dữ liệu JSONP
    const script = document.createElement('script');
    script.src = API_URL + '?callback=handleJsonpResponse';
    
    // Xử lý khi có lỗi tải file script (mạng yếu...)
    script.onerror = function() {
        console.error("Lỗi kết nối JSONP");
        if (container) {
            container.innerHTML = `<div style="text-align: center; color: red; font-weight: bold;">Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.</div>`;
        }
    };
    
    document.body.appendChild(script);
}

function hienThiTaiLieu(danhSachTaiLieu) {
    const container = document.getElementById("data-container");
    if (!container) return; 
    
    container.innerHTML = "";

    if (danhSachTaiLieu.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 20px;">Không tìm thấy tài liệu phù hợp.</div>`;
        return;
    }

    danhSachTaiLieu.forEach(taiLieu => {
        let badgeQuyen = taiLieu.quyen === "GV" ? '<span class="badge word">📄 Bản GV</span>' : '<span class="badge pdf">📕 PDF (Cho HS)</span>';
        
        const cardHTML = `
            <div class="d10-doc-card">
                <div class="d10-badges">
                    <span class="badge new">${taiLieu.loai || 'Tài liệu'}</span>
                    ${badgeQuyen}
                </div>
                
                <h3 style="margin: 10px 0; color: var(--primary-color); line-height: 1.4;">${taiLieu.ten || 'Đang cập nhật'}</h3>
                
                <p style="margin: 5px 0; font-size: 14px; color: #555;">
                    Khối: <strong>${taiLieu.khoi || '...'}</strong> | Môn: <strong>${taiLieu.mon || '...'}</strong> | Đăng bởi: <strong>${taiLieu.nguoi_dang || 'PĐT'}</strong>
                </p>
                
                <p style="font-size: 14px; line-height: 1.5;">Mô tả: ${taiLieu.mo_ta || ''}</p>
                
                <button onclick="window.open('${taiLieu.drive_preview}', '_blank')" style="background: var(--primary-color); color: #fff; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-top: 10px; font-weight: bold;">
                    👁️ Đọc thử
                </button>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// Bắt sự kiện cho nút tìm kiếm an toàn
const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        const keyword = document.getElementById('searchInput').value.toLowerCase();
        const ketQuaLoc = allDocuments.filter(doc => {
            return (doc.ten && doc.ten.toLowerCase().includes(keyword)) || 
                   (doc.mon && doc.mon.toLowerCase().includes(keyword)) ||
                   (doc.nhom && doc.nhom.toLowerCase().includes(keyword));
        });
        hienThiTaiLieu(ketQuaLoc);
    });
}

// Bắt sự kiện phím Enter
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && searchBtn) {
            searchBtn.click();
        }
    });
}

// Khởi chạy khi load trang
window.onload = fetchKhoHocLieu;
