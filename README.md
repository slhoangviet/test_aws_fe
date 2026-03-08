# Image Processor — Frontend (Next.js)

Web xử lý ảnh: upload, resize, crop, điều chỉnh độ sáng/tương phản/bão hòa, xuất WebP/JPEG/PNG.

## Công nghệ

- **Next.js 15** (App Router) — SSR, file-based routing, metadata cho SEO
- **React 18**, TypeScript
- **Đa ngôn ngữ:** client-side (VI/EN), header `x-locale` gửi sang BE

## Scripts

- `yarn dev` — chạy dev server (mặc định http://localhost:3000)
- `yarn build` — build production
- `yarn start` — chạy bản build

## Biến môi trường

- `NEXT_PUBLIC_API_URL` — URL backend (vd: `http://localhost:3001`). Để trống nếu dùng same-origin/proxy.

Copy từ `.env.example` sang `.env.local` và sửa nếu cần.

## Cấu trúc (SEO)

- **`app/layout.tsx`** — Root layout, metadata chung (title, description, Open Graph)
- **`app/page.tsx`** — Trang chủ (/)
- **`app/editor/page.tsx`** — Trang chỉnh sửa ảnh (/editor), metadata riêng
- Mỗi route có thể export `metadata` hoặc `generateMetadata` để tối ưu SEO (title, description, OG).

## Đa ngôn ngữ

- Bộ chọn ngôn ngữ trên header; mọi request API gửi header **`x-locale`**.
- Thêm ngôn ngữ: `src/i18n/config.ts` (SUPPORTED_LOCALES) và `src/i18n/translations.ts`.

## Deploy

Build tĩnh (static export) không dùng được vì có API gọi động. Deploy dạng Node (e.g. `yarn build && yarn start`) hoặc lên Vercel/Netlify. Khi deploy lên S3 + CDN, dùng `next build` rồi upload `.next` + chạy `next start` trên server, hoặc dùng platform hỗ trợ Next.js.
