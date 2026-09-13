'use client';

import React from 'react';
import { Invoice, PaymentAttempt, SchoolProfile } from '@/types';
import { formatRupiah, formatDateIndo, formatDateTimeIndo, getMonthName } from '@/lib/format';
import { CheckCircle, Printer, X, ShieldCheck } from 'lucide-react';

interface PaymentReceiptModalProps {
  invoice: Invoice | null;
  payment?: PaymentAttempt | null;
  schoolProfile: SchoolProfile;
  onClose: () => void;
}

export function PaymentReceiptModal({
  invoice,
  payment,
  schoolProfile,
  onClose,
}: PaymentReceiptModalProps) {
  if (!invoice) return null;

  const receiptNumber = `KWT-${invoice.invoiceNumber.replace(/[^0-9]/g, '') || invoice.id.slice(-6).toUpperCase()}`;
  const paidDate = invoice.paidAt || payment?.settlementTime || invoice.createdAt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        {/* Modal Action Header (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Kwitansi Resmi SPP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 print:p-6" id="printable-receipt">
          {/* Header Kop Surat */}
          <div className="border-b-2 border-slate-800 pb-5 mb-6 text-center relative">
            <div className="inline-block p-2 bg-emerald-700 text-white rounded-xl mb-2 font-bold tracking-wider text-xs">
              DARUL ILMI
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {schoolProfile.name}
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
              {schoolProfile.address} • Telp: {schoolProfile.phone}
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">
              Email: {schoolProfile.email}
            </p>
          </div>

          {/* Receipt Title & Status Stamp */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Bukti Pembayaran SPP
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {receiptNumber}
              </h3>
              <p className="text-xs text-slate-500" suppressHydrationWarning>
                Tanggal: {formatDateTimeIndo(paidDate)}
              </p>
            </div>

            {/* Stamp Lunas */}
            <div className="border-2 border-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg text-emerald-700 flex items-center gap-2 transform -rotate-2 shadow-xs">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-black tracking-widest uppercase">LUNAS</div>
                <div className="text-[10px] font-semibold text-emerald-800">
                  {invoice.paymentMethod || 'MIDTRANS'}
                </div>
              </div>
            </div>
          </div>

          {/* Student & Bill Details Grid */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Nama Santri / Siswa</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {invoice.studentName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Nomor Induk (NIS)</span>
                <span className="font-semibold text-slate-800">
                  {invoice.studentNis || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Kelas / Jenjang</span>
                <span className="font-semibold text-slate-800">
                  {invoice.className}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Orang Tua / Wali</span>
                <span className="font-semibold text-slate-800">
                  {invoice.parentName}
                </span>
              </div>
            </div>
          </div>

          {/* Item Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Deskripsi Pembayaran</th>
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    SPP Bulanan ({invoice.className})
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {getMonthName(invoice.month)} {invoice.year} ({invoice.academicYear})
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                    {formatRupiah(invoice.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-right text-slate-700">
                    Total Pembayaran
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700 text-sm">
                    {formatRupiah(invoice.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification & Signatures */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg flex flex-col items-center justify-center p-1 text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">VALIDATED</span>
              </div>
              <div className="text-[11px] text-slate-500 leading-snug">
                <p className="font-semibold text-slate-700">Bukti Elektronik Sah</p>
                <p>Verifikasi Midtrans Payment Gateway</p>
                <p className="font-mono text-[10px] text-slate-400">
                  ID: {payment?.orderId || invoice.invoiceNumber}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-slate-400 mb-1">Bendahara Sekolah,</p>
              <div className="h-10"></div>
              <p className="font-bold text-slate-800 underline decoration-slate-400 underline-offset-4">
                {schoolProfile.treasurerName}
              </p>
              <p className="text-[10px] text-slate-500">NIP/NIY: 19840815.201001.1.002</p>
            </div>
          </div>
        </div>

        {/* Footer (hidden on print) */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
