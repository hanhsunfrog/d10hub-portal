/* =========================================================
   KẾT NỐI DỮ LIỆU GOOGLE SHEETS & XỬ LÝ GIAO DIỆN
   ========================================================= */

// 1. CẤU HÌNH API
const API_URL = 'https://script.google.com/macros/s/AKfycbzogD2eCZPfidJ3WZLx56lZzzPcUAUyASyiUyWiYH8QzhGFDTj7BgQFoP1A-aMBwmOmIA/exec';
let allDocuments = []; // Biến lưu trữ toàn bộ dữ liệu gốc

// 2. HÀM TẢI DỮ LIỆU TỪ APPS SCRIPT
async function fetchKhoHocLieu() {
    const container = document.getElementById("data-container");
    container.innerHTML = `<div style="text-align: center; padding: 20px;">Đang tải dữ liệu từ kho...</div>`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Cập nhật biến toàn cục
        allDocuments = data;
        
        // Cập nhật số lượng tài liệu hiển thị
        document.querySelector("p[aria-live='polite']").innerHTML = `Hiển thị <span class="font-bold text-brand-red">${allDocuments.length}</span> tài liệu bám sát chương trình`;
        
        // Hiển thị ra màn hình
        hienThiTaiLieu(allDocuments);
        
    } catch (error) {
        console.error("Lỗi kết nối API:", error);
        container.innerHTML = `<div style="text-align: center; color: red;">Không thể kết nối đến máy chủ. Vui lòng tải lại trang.</div>`;
    }
}

// 3. HÀM RENDER HTML GIAO DIỆN
function hienThiTaiLieu(danhSachTaiLieu) {
    const container = document.getElementById("data-container");
    container.innerHTML = ""; // Xóa dữ liệu loading

    if (danhSachTaiLieu.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 20px;">Không tìm thấy tài liệu phù hợp.</div>`;
        return;
    }

    danhSachTaiLieu.forEach(taiLieu => {
        // Tạo nhãn (badge) dựa trên dữ liệu
        let badgeQuyen = taiLieu.quyen === "GV" ? '<span class="badge word">📄 Bản GV</span>' : '<span class="badge pdf">📕 PDF (Cho HS)</span>';
        
        // Template cho 1 thẻ tài liệu
        const cardHTML = `
            <div class="d10-doc-card">
                <div class="d10-badges">
                    <span class="badge new">${taiLieu.loai}</span>
                    ${badgeQuyen}
                </div>
                
                <h3 style="margin: 10px 0; color: var(--primary-color);">${taiLieu.ten}</h3>
                
                <p style="margin: 5px 0; font-size: 14px; color: #555;">
                    Khối: <strong>${taiLieu.khoi}</strong> | Môn: <strong>${taiLieu.mon}</strong> | Đăng bởi: <strong>${taiLieu.nguoi_dang}</strong>
                </p>
                
                <p style="font-size: 14px; line-height: 1.5;">Mô tả: ${taiLieu.mo_ta}</p>
                
                <button onclick="window.open('${taiLieu.drive_preview}', '_blank')" style="background: var(--primary-color); color: #fff; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                    👁️ Đọc thử
                </button>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// 4. CHỨC NĂNG TÌM KIẾM
document.getElementById('searchBtn').addEventListener('click', function() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    
    const ketQuaLoc = allDocuments.filter(doc => {
        // Tìm từ khóa trong Tên tài liệu, Môn, hoặc Nhóm
        return (doc.ten && doc.ten.toLowerCase().includes(keyword)) || 
               (doc.mon && doc.mon.toLowerCase().includes(keyword)) ||
               (doc.nhom && doc.nhom.toLowerCase().includes(keyword));
    });
    
    hienThiTaiLieu(ketQuaLoc);
});

// Chạy tìm kiếm khi ấn phím Enter trong ô input
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// 5. CHẠY KHI TẢI TRANG
window.onload = fetchKhoHocLieu;