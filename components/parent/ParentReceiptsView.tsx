'use client';

import React from 'react';
import { Invoice } from '@/types';
import { formatRupiah, formatDateIndo, getMonthName } from '@/lib/format';
import { Receipt, CheckCircle, Printer, Download } from 'lucide-react';

interface ParentReceiptsViewProps {
  paidInvoices: Invoice[];
  onViewReceipt: (invoice: Invoice) => void;
}

export function ParentReceiptsView({
  paidInvoices,
  onViewReceipt,
}: ParentReceiptsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Bukti Pembayaran & Kwitansi Resmi</h2>
        <p className="text-xs text-slate-500">
          Unduh atau cetak tanda terima pembayaran SPP yang telah lunas diverifikasi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paidInvoices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            Belum ada bukti pembayaran lunas.
          </div>
        ) : (
          paidInvoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3" />
                    LUNAS
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-0.5">
                  SPP {getMonthName(inv.month)} {inv.year}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Santri: <strong className="text-slate-800">{inv.studentName}</strong> ({inv.className})
                </p>

                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">No. Kwitansi:</span>
                    <span className="font-mono font-bold text-slate-700">{inv.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tanggal Lunas:</span>
                    <span className="font-medium text-slate-700">
                      {inv.paidAt ? formatDateIndo(inv.paidAt) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kanal Bayar:</span>
                    <span className="font-semibold text-emerald-700 uppercase">
                      {inv.paymentMethod || 'Midtrans Online'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between mb-4">
                  <span className="text-xs text-slate-400">Total Dibayar:</span>
                  <span className="text-lg font-extrabold text-emerald-700">
                    {formatRupiah(inv.amount)}
                  </span>
                </div>

                <button
                  onClick={() => onViewReceipt(inv)}
                  className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Lihat &amp; Cetak Kwitansi
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
