# Food & Chill 3D

Khu ẩm thực 3D của Kiomath: đi lại, gặp nhân vật và giải 4 nhiệm vụ Toán về BMI, calo, bữa ăn vặt của Đạt và giỏ dinh dưỡng của thầy Minh. Có quầy quay số trúng thưởng với mini game gacha.

- Toàn bộ trò chơi nằm trong `index.html` (Three.js r128 tải từ cdnjs).
- Triển khai trên Vercel như một trang tĩnh, không cần build.

## Danh sách người chơi (Google Sheets)

Màn hình bắt đầu yêu cầu Họ tên và Lớp. Để game ghi danh sách người chơi vào Google Sheet, làm theo hướng dẫn ở đầu file `apps-script.gs`, rồi dán URL Ứng dụng web vào dòng `const PLAYER_API='';` trong `index.html`.
