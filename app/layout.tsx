import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Sistem Pembayaran SPP Bulanan',
  description: 'Aplikasi manajemen dan pembayaran SPP bulanan sekolah dan pesantren terintegrasi Midtrans dan Firebase',
  openGraph: {
    title: 'Sistem Pembayaran SPP Bulanan',
    description: 'Aplikasi manajemen dan pembayaran SPP bulanan sekolah dan pesantren terintegrasi Midtrans dan Firebase',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistem Pembayaran SPP Bulanan',
    description: 'Aplikasi manajemen dan pembayaran SPP bulanan sekolah dan pesantren terintegrasi Midtrans dan Firebase',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
