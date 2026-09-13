'use client';

import React, { useState } from 'react';
import { Invoice, Student } from '@/types';
import { formatRupiah, getMonthName } from '@/lib/format';
import { CreditCard, Receipt, Search, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react';

interface ParentInvoicesViewProps {
  invoices: Invoice[];
  students: Student[];
  onPayInvoice: (invoice: Invoice) => void;
  onViewReceipt: (invoice: Invoice) => void;
}

export function ParentInvoicesView({
  invoices,
  students,
  onPayInvoice,
  onViewReceipt,
}: ParentInvoicesViewProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNPAID' | 'PAID' | 'EXPIRED'>('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');

  const filtered = invoices.filter((inv) => {
    const matchStudent = selectedStudentId === 'ALL' || inv.studentId === selectedStudentId;
    let matchTab = true;
    if (activeTab === 'UNPAID') matchTab = inv.status === 'UNPAID' || inv.status === 'PENDING';
    if (activeTab === 'PAID') matchTab = inv.status === 'PAID';
    if (activeTab === 'EXPIRED') matchTab = inv.status === 'EXPIRED';

    return matchStudent && matchTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tagihan SPP Ananda</h2>
          <p className="text-xs text-slate-500">
            Daftar tagihan SPP bulanan resmi santri terdaftar
          </p>
        </div>

        {/* Filter Student */}
        {students.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Pilih Santri:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="ALL">Semua Anak ({students.length} santri)</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.className})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'ALL'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Semua Tagihan ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('UNPAID')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'UNPAID'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Belum Dibayar ({invoices.filter((i) => i.status === 'UNPAID' || i.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('EXPIRED')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'EXPIRED'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Tunggakan ({invoices.filter((i) => i.status === 'EXPIRED').length})
        </button>
        <button
          onClick={() => setActiveTab('PAID')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'PAID'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Lunas ({invoices.filter((i) => i.status === 'PAID').length})
        </button>
      </div>

      {/* Invoices List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            Tidak ada tagihan yang sesuai dengan filter.
          </div>
        ) : (
          filtered.map((inv) => {
            const isPaid = inv.status === 'PAID';
            const isOverdue = inv.status === 'EXPIRED';

            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPaid ? <CheckCircle className="w-3 h-3" /> : null}
                      {isOverdue ? <AlertTriangle className="w-3 h-3" /> : null}
                      {isPaid ? 'LUNAS' : isOverdue ? 'TUNGGAKAN' : inv.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-0.5">
                    SPP {getMonthName(inv.month)} {inv.year}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Santri: <span className="font-semibold text-slate-800">{inv.studentName}</span> ({inv.className})
                  </p>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jatuh Tempo:</span>
                      <span className="font-medium text-slate-700">{inv.dueDate}</span>
                    </div>
                    {isPaid && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Metode:</span>
                        <span className="uppercase">{inv.paymentMethod || 'Online'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between mb-4">
                    <span className="text-xs text-slate-400">Nominal:</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {formatRupiah(inv.amount)}
                    </span>
                  </div>

                  {isPaid ? (
                    <button
                      onClick={() => onViewReceipt(inv)}
                      className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      Lihat & Cetak Kwitansi
                    </button>
                  ) : (
                    <button
                      onClick={() => onPayInvoice(inv)}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      Bayar Sekarang via Midtrans
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
