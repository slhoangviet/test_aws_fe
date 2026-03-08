# CI/CD — Frontend (test_aws_fe)

Workflow: `.github/workflows/ci.yml` — build mỗi push/PR; **deploy lên S3** khi push `main` hoặc `develop`.

## Cần setup trên GitHub

1. **Repo là root của project**  
   Clone/push riêng (vd. `your-org/test_aws_fe`). Workflow chạy tại root repo.

2. **Bật GitHub Actions**  
   Settings → Actions → General → Allow all actions.

3. **Secrets (Settings → Secrets and variables → Actions)** — bắt buộc cho job **deploy**:

   | Secret | Mô tả |
   |--------|--------|
   | `AWS_ACCESS_KEY_ID` | IAM user dùng sync S3 (và CloudFront nếu dùng) |
   | `AWS_SECRET_ACCESS_KEY` | Secret key tương ứng |
   | `AWS_REGION` | VD: `ap-southeast-2` (có default trong workflow) |
   | `FRONTEND_S3_BUCKET` | Tên bucket S3 chứa build (phục vụ qua CDN) |
   | `CLOUDFRONT_DISTRIBUTION_ID` | (Tùy chọn) ID distribution CloudFront để invalidate cache sau deploy |

4. **IAM user** (dùng cho `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`):
   - Quyền tối thiểu: `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` trên bucket FE.
   - Nếu dùng bước Invalidate CloudFront: thêm `cloudfront:CreateInvalidation` trên distribution đó.

5. **Bucket S3**  
   - Đã tạo bucket, bật static hosting hoặc dùng CloudFront origin trỏ tới bucket.  
   - Policy bucket cho phép IAM user trên ghi/xóa; nếu public read thì cấu hình phù hợp (hoặc chỉ đọc qua CloudFront).

## Luồng chạy

- **Push/PR** → job `build`: install, build, upload artifact `dist`.
- **Push main/develop** → thêm job `deploy`: tải artifact, sync lên S3, (nếu có) invalidate CloudFront.
