import type { Metadata } from 'next';
import { ClientProviders } from './ClientProviders';
import { AppShell } from './AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Photo Editor — Chỉnh sửa ảnh chuyên nghiệp',
  description:
    'Chỉnh sửa ảnh chuyên nghiệp trên trình duyệt: resize, crop, độ sáng, tương phản, bão hòa. Xuất WebP, JPEG, PNG. Professional image editing in the browser.',
  openGraph: {
    title: 'Photo Editor — Chỉnh sửa ảnh chuyên nghiệp',
    description:
      'Chỉnh sửa ảnh chuyên nghiệp trên trình duyệt: resize, crop, điều chỉnh, xuất WebP/JPEG/PNG.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientProviders>
          <AppShell>{children}</AppShell>
        </ClientProviders>
      </body>
    </html>
  );
}
