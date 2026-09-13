'use client';

import React from 'react';
import { SchoolProfile } from '@/types';
import { CreditCard, QrCode, Building2, ShieldCheck, Zap, HelpCircle } from 'lucide-react';

interface ParentPaymentsGuideViewProps {
  schoolProfile: SchoolProfile;
  onGoToInvoices: () => void;
}

export function ParentPaymentsGuideView({
  schoolProfile,
  onGoToInvoices,
}: ParentPaymentsGuideViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Saluran & Panduan Pembayaran SPP</h2>
        <p className="text-xs text-slate-500">
          Pesantren menyediakan berbagai kanal pembayaran online instan dan otomatis melalui Midtrans Snap
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QRIS Channel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">QRIS (Semua E-Wallet & Mobile Banking)</h3>
              <p className="text-xs text-slate-400">Scan dan bayar langsung dari smartphone</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>Didukung oleh seluruh aplikasi perbankan dan dompet digital di Indonesia:</p>
            <div className="flex flex-wrap gap-2 py-2">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-700">BCA Mobile</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-700">Livin Mandiri</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-700">BRImo</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-700">GoPay</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-700">OVO</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-700">Dana</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-500">
              <li>Pilih tagihan SPP ananda di menu <strong>Tagihan</strong> lalu klik <strong>Bayar Sekarang</strong>.</li>
              <li>Pilih metode pembayaran <strong>QRIS / GoPay</strong> pada pop-up Midtrans.</li>
              <li>Scan kode QR yang muncul dengan aplikasi m-banking atau e-wallet Anda.</li>
              <li>Status tagihan akan otomatis berubah menjadi <strong>LUNAS</strong> dalam beberapa detik.</li>
            </ol>
          </div>
        </div>

        {/* Virtual Account Bank */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Virtual Account (VA Bank)</h3>
              <p className="text-xs text-slate-400">Transfer otomatis tanpa perlu konfirmasi manual</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>Tersedia nomor rekening Virtual Account resmi untuk berbagai bank:</p>
            <div className="flex flex-wrap gap-2 py-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">BCA VA</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">Mandiri VA</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">BNI VA</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">BRI VA</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">Permata VA</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-500">
              <li>Pilih tagihan lalu klik <strong>Bayar Sekarang</strong>.</li>
              <li>Pilih menu <strong>Bank Transfer / Virtual Account</strong> dan pilih bank Anda.</li>
              <li>Salin nomor Virtual Account yang diterbitkan oleh Midtrans.</li>
              <li>Lakukan transfer via ATM, Mobile Banking, atau Internet Banking.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Benefits Card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">Pembayaran Cepat, Aman, &amp; Otomatis</h4>
            <p className="text-xs text-emerald-700">
              Tidak perlu kirim struk transfer via WhatsApp! Sistem mendeteksi pembayaran secara real-time.
            </p>
          </div>
        </div>

        <button
          onClick={onGoToInvoices}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs cursor-pointer"
        >
          Lihat Tagihan Ananda →
        </button>
      </div>
    </div>
  );
}
