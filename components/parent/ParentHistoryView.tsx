'use client';

import React from 'react';
import { PaymentAttempt, Invoice } from '@/types';
import { formatRupiah, formatDateTimeIndo } from '@/lib/format';
import { History, CheckCircle, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface ParentHistoryViewProps {
  payments: PaymentAttempt[];
  invoices: Invoice[];
  onViewReceipt: (invoice: Invoice) => void;
}

export function ParentHistoryView({
  payments,
  invoices,
  onViewReceipt,
}: ParentHistoryViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Riwayat Transaksi Pembayaran</h2>
        <p className="text-xs text-slate-500">
          Daftar seluruh aktivitas pembayaran SPP yang pernah dilakukan melalui sistem
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID & Tanggal</th>
                <th className="py-3 px-4">Tagihan & Santri</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Kwitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada riwayat transaksi pembayaran.
                  </td>
                </tr>
              ) : (
                payments.map((pay) => {
                  const inv = invoices.find((i) => i.id === pay.invoiceId);
                  const isSettled = pay.transactionStatus === 'settlement';

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800 block">
                          {pay.orderId}
                        </span>
                        <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                          {formatDateTimeIndo(pay.settlementTime || pay.createdAt)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {inv ? inv.studentName : 'Santri'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {pay.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-semibold text-slate-700">
                        {pay.paymentType || 'Midtrans'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatRupiah(pay.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isSettled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isSettled ? <CheckCircle className="w-3 h-3" /> : null}
                          {pay.transactionStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSettled && inv ? (
                          <button
                            onClick={() => onViewReceipt(inv)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                          >
                            Buka Kwitansi
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
