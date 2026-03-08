import type { Metadata } from 'next';
import { EditorPage } from '@/features/editor';

export const metadata: Metadata = {
  title: 'Chỉnh sửa ảnh — Photo Editor',
  description:
    'Upload ảnh, resize, crop, điều chỉnh độ sáng — tương phản — bão hòa, xuất WebP / JPEG / PNG. Edit image in browser.',
};

export default function Editor() {
  return <EditorPage />;
}
