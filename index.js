const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Đã cập nhật API gốc mới theo yêu cầu
const API_URL = "https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=08eee6bdcb7f6bf0b4c3bfd9dc0a4141";

app.get('/predict', async (req, res) => {
    try {
        // Gọi API lấy dữ liệu
        const response = await axios.get(API_URL);
        const dataList = response.data.list;

        // Chỉ lấy phiên mới nhất (index 0) và phiên liền trước (index 1)
        let currentSession = dataList[0];
        let previousSession = dataList[1];

        // Lấy dữ liệu theo công thức
        let totalPoint = currentSession.point;
        let prevDice1 = previousSession.dices[0];
        
        // Cộng thêm 1 vào số phiên như bạn muốn
        let displaySessionId = currentSession.id + 1;

        // Tính toán: Tổng điểm 3 xí ngầu + Xí ngầu 1 phiên trước
        let calcResult = totalPoint + prevDice1;
        
        // Xác định Tài / Xỉu (Chẵn = Tài, Lẻ = Xỉu)
        let prediction = (calcResult % 2 === 0) ? "TÀI" : "XỈU";
        
        // Random tỉ lệ tin cậy 50 - 98%
        let confidence = Math.floor(Math.random() * (98 - 50 + 1)) + 50;

        // Đóng gói kết quả gọn gàng
        let result = {
            "Phien": displaySessionId,
            "Tong_diem_hien_tai": totalPoint,
            "Xi_ngau_1_phien_truoc": prevDice1,
            "Phep_tinh": `${totalPoint} + ${prevDice1} = ${calcResult}`,
            "Du_doan": prediction,
            "Do_tin_cay": `${confidence}%`
        };

        // Trả về JSON chỉ có 1 phiên duy nhất cho gọn đẹp
        res.json({
            status: "success",
            data: result
        });

    } catch (error) {
        console.error("Lỗi:", error.message);
        res.status(500).json({ 
            status: "error", 
            message: "Không thể lấy dữ liệu từ API gốc",
            detail: error.message 
        });
    }
});

// Route kiểm tra server sống
app.get('/', (req, res) => {
    res.send("Tool dự đoán đang chạy. Truy cập /predict để lấy kết quả.");
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});