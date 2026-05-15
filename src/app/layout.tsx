import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Roboto_Slab } from 'next/font/google';
import './globals.css';

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AAMIHE',
  description: 'Site oficial AAMIHE',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" className={robotoSlab.className}>
      <body>{children}</body>
    </html>
  );
}
