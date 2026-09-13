'use client';

import React, { useState } from 'react';
import { PaymentAttempt, Invoice } from '@/types';
import { formatRupiah, formatDateTimeIndo } from '@/lib/format';
import { CreditCard, Search, CheckCircle, Clock, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

interface AdminPaymentsViewProps {
  payments: PaymentAttempt[];
  invoices: Invoice[];
  onViewReceipt: (invoice: Invoice) => void;
}

export function AdminPaymentsView({
  payments,
  invoices,
  onViewReceipt,
}: AdminPaymentsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredPayments = payments.filter((p) => {
    const inv = invoices.find((i) => i.id === p.invoiceId);
    const matchSearch =
      p.orderId.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv && inv.studentName.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || p.transactionStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Riwayat Pembayaran & Transaksi Midtrans</h2>
          <p className="text-xs text-slate-500">
            Log seluruh percobaan pembayaran yang dikirim ke gateway Midtrans Snap
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari Order ID, No. Invoice, atau nama santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer"
        >
          <option value="ALL">Semua Status Transaksi</option>
          <option value="settlement">Settlement (Berhasil / Lunas)</option>
          <option value="pending">Pending (Menunggu Pembayaran)</option>
          <option value="expire">Expire (Kadaluarsa)</option>
          <option value="cancel">Cancel (Dibatalkan)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID & Waktu</th>
                <th className="py-3 px-4">No. Invoice & Santri</th>
                <th className="py-3 px-4">Metode Channel</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Status Transaksi</th>
                <th className="py-3 px-4 text-right">Kwitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada log pembayaran yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => {
                  const inv = invoices.find((i) => i.id === pay.invoiceId);
                  const isSettled = pay.transactionStatus === 'settlement';
                  const isExpire = pay.transactionStatus === 'expire';

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800 block">
                          {pay.orderId}
                        </span>
                        <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                          {formatDateTimeIndo(pay.createdAt)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">
                          {inv ? inv.studentName : 'Santri'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
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
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            isSettled
                              ? 'bg-emerald-100 text-emerald-800'
                              : isExpire
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isSettled ? <CheckCircle className="w-3 h-3" /> : null}
                          {isExpire ? <AlertTriangle className="w-3 h-3" /> : null}
                          {pay.transactionStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSettled && inv ? (
                          <button
                            onClick={() => onViewReceipt(inv)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                          >
                            Lihat Kwitansi
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
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
