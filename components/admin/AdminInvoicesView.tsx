'use client';

import React, { useState } from 'react';
import { Invoice, PaymentAttempt, ClassItem } from '@/types';
import { formatRupiah, formatDateIndo, formatDateTimeIndo, getMonthName, INDO_MONTHS } from '@/lib/format';
import {
  FileText,
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Eye,
  DollarSign,
  Layers,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

interface AdminInvoicesViewProps {
  invoices: Invoice[];
  payments: PaymentAttempt[];
  classes: ClassItem[];
  onOpenGenerateModal: () => void;
  onMarkPaidManual: (invoiceId: string) => Promise<any>;
  onViewReceipt: (invoice: Invoice) => void;
  onPayOnline?: (invoice: Invoice) => void;
}

export function AdminInvoicesView({
  invoices,
  payments,
  classes,
  onOpenGenerateModal,
  onMarkPaidManual,
  onViewReceipt,
  onPayOnline,
}: AdminInvoicesViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.studentName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.studentNis.includes(search);
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchClass = classFilter === 'ALL' || inv.classId === classFilter;
    const matchMonth = monthFilter === 'ALL' || inv.month === Number(monthFilter);

    return matchSearch && matchStatus && matchClass && matchMonth;
  });

  // Get payment attempts for a specific invoice
  const getInvoicePayments = (invoiceId: string) => {
    return payments.filter((p) => p.invoiceId === invoiceId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" />
            LUNAS
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3" />
            TUNGGAKAN
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
            BATAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
            BELUM BAYAR
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tagihan SPP Santri</h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh invoice tagihan SPP bulanan, status verifikasi, dan riwayat pembayaran
          </p>
        </div>
        <button
          onClick={onOpenGenerateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Generate Tagihan Massal
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor invoice, nama santri, atau NIS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="UNPAID">UNPAID (Belum Bayar)</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID (Lunas)</option>
              <option value="EXPIRED">EXPIRED (Tunggakan)</option>
            </select>

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Month Filter */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Semua Bulan</option>
              {INDO_MONTHS.slice(1).map((mName, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {mName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Count summary bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Menampilkan {filteredInvoices.length} tagihan</span>
          <div className="flex gap-3">
            <span>
              Lunas:{' '}
              <strong className="text-emerald-700">
                {invoices.filter((i) => i.status === 'PAID').length}
              </strong>
            </span>
            <span>
              Belum Bayar:{' '}
              <strong className="text-blue-700">
                {invoices.filter((i) => i.status === 'UNPAID').length}
              </strong>
            </span>
            <span>
              Tunggakan:{' '}
              <strong className="text-rose-700">
                {invoices.filter((i) => i.status === 'EXPIRED').length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Santri & Kelas</th>
                <th className="py-3 px-4">Periode SPP</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Percobaan Bayar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada tagihan yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const attempts = getInvoicePayments(inv.id);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{inv.studentName}</span>
                        <span className="text-[10px] text-slate-400">
                          {inv.className} • NIS: {inv.studentNis}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {getMonthName(inv.month)} {inv.year}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {inv.dueDate || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatRupiah(inv.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-mono text-[11px] cursor-pointer"
                        >
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{attempts.length} attempts</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status === 'PAID' ? (
                            <button
                              onClick={() => onViewReceipt(inv)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                              title="Lihat Kwitansi"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              Kwitansi
                            </button>
                          ) : (
                            <>
                              {onPayOnline && (
                                <button
                                  onClick={() => onPayOnline(inv)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                                  title="Bayar Online via Midtrans Snap"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  Midtrans
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Tandai tagihan ${inv.invoiceNumber} (${inv.studentName}) sebagai LUNAS via Kasir Tunai?`
                                    )
                                  ) {
                                    onMarkPaidManual(inv.id);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                                title="Bayar Tunai di Kasir"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                Bayar Tunai
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                            title="Detail Tagihan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail & Payment Attempts Tree Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-800">
                  Detail Invoice & Riwayat Percobaan Pembayaran
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Top summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block">Nomor Invoice</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {selectedInvoice.invoiceNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status Tagihan</span>
                  <div className="mt-0.5">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block">Santri / Siswa</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nominal Tagihan</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatRupiah(selectedInvoice.amount)}
                  </span>
                </div>
              </div>

              {/* Requirement Visualization:
                  Pisahkan `invoices` dan `payments` agar satu invoice dapat memiliki beberapa percobaan pembayaran.
                  Contoh:
                  Invoice September
                  ├── Payment 1 → EXPIRED
                  ├── Payment 2 → FAILED
                  └── Payment 3 → PAID
              */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Struktur Relasi Invoices ↔ Payments (Midtrans Attempts)
                </h4>
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-[11px] leading-relaxed">
                  <div className="text-emerald-400 font-bold mb-2">
                    Invoice {getMonthName(selectedInvoice.month)} {selectedInvoice.year} (
                    {selectedInvoice.invoiceNumber})
                  </div>
                  {getInvoicePayments(selectedInvoice.id).length === 0 ? (
                    <div className="text-slate-400 pl-4">
                      └── Belum ada percobaan pembayaran (UNPAID)
                    </div>
                  ) : (
                    getInvoicePayments(selectedInvoice.id).map((pay, idx, arr) => {
                      const isLast = idx === arr.length - 1;
                      const prefix = isLast ? '└── ' : '├── ';
                      const statusColor =
                        pay.transactionStatus === 'settlement'
                          ? 'text-emerald-400 font-bold'
                          : pay.transactionStatus === 'pending'
                          ? 'text-amber-400'
                          : 'text-rose-400';

                      return (
                        <div key={pay.id} className="pl-2">
                          <span className="text-slate-500">{prefix}</span>
                          <span className="text-slate-300">Payment {idx + 1} ({pay.paymentType || 'midtrans'})</span>
                          <span className="text-slate-500"> → </span>
                          <span className={statusColor}>
                            {pay.transactionStatus.toUpperCase()}
                          </span>
                          <span className="text-slate-500 text-[10px] ml-2">
                            ({formatDateTimeIndo(pay.createdAt)})
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                {selectedInvoice.status === 'PAID' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const inv = selectedInvoice;
                      setSelectedInvoice(null);
                      onViewReceipt(inv);
                    }}
                    className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    Cetak Kwitansi
                  </button>
                ) : (
                  <>
                    {onPayOnline && (
                      <button
                        type="button"
                        onClick={() => {
                          const inv = selectedInvoice;
                          setSelectedInvoice(null);
                          onPayOnline(inv);
                        }}
                        className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-sky-700 transition"
                      >
                        <CreditCard className="w-4 h-4" />
                        Bayar Online
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onMarkPaidManual(selectedInvoice.id);
                        setSelectedInvoice(null);
                      }}
                      className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-800 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Lunas Tunai
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
