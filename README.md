# Photo Editor (Frontend)

Ứng dụng chỉnh sửa ảnh giao diện kiểu editor: theme tối, thanh công cụ, canvas giữa, panel trái (công cụ) và phải (thư viện ảnh).

## Tính năng

- **Mở ảnh:** Upload từ máy (JPG, PNG, WebP, tối đa 10MB).
- **Kích thước:** Resize theo chiều rộng/cao (px), giữ tỷ lệ.
- **Cắt (Crop):** Left, Top, Width, Height (px).
- **Điều chỉnh:** Slider Độ sáng, Tương phản, Bão hòa (0.2–2).
- **Xuất file:** Định dạng WebP / JPEG / PNG, chất lượng 1–100%. Nút **Áp dụng / Xuất** để xử lý và xem kết quả trên canvas, tải xuống từ panel phải.

Cần backend (api.{domain}) chạy với endpoint `/upload`, `/files`, `/files/:id/process`, `/files/:id` (DELETE). Set `VITE_API_URL` trong `.env` khi dev.

## Chạy

```bash
yarn install
yarn dev
```

## Build

```bash
yarn build
```
