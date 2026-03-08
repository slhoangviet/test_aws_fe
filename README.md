# Web xử lý ảnh (Frontend)

Giao diện cho ứng dụng **xử lý ảnh**: upload, xem kho ảnh, resize, đổi định dạng (WebP, JPEG, PNG) và nén chất lượng. Kết nối API backend (api.{domain}).

## Chạy

```bash
yarn install
yarn dev
```

Set `VITE_API_URL` (vd. `http://localhost:3000`) trong `.env` nếu backend chạy ở origin khác.

## Build

```bash
yarn build
```

Output trong `dist/`, deploy lên S3 + CDN (xem `CICD.md`).
