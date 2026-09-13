'use client';

import React from 'react';
import { Parent, Student, Invoice, PaymentAttempt, SchoolProfile } from '@/types';
import { formatRupiah, getMonthName } from '@/lib/format';
import {
  GraduationCap,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';

interface ParentDashboardViewProps {
  currentParent: Parent | null;
  students: Student[];
  invoices: Invoice[];
  payments: PaymentAttempt[];
  schoolProfile: SchoolProfile;
  onPayInvoice: (invoice: Invoice) => void;
  onViewReceipt: (invoice: Invoice) => void;
  onNavigateTab: (tab: any) => void;
}

export function ParentDashboardView({
  currentParent,
  students,
  invoices,
  payments,
  schoolProfile,
  onPayInvoice,
  onViewReceipt,
  onNavigateTab,
}: ParentDashboardViewProps) {
  if (!currentParent) return null;

  // Filter students linked to this parent
  const linkedStudents = students.filter(
    (s) => s.parentId === currentParent.id || currentParent.studentIds?.includes(s.id)
  );

  const studentIds = linkedStudents.map((s) => s.id);

  // Invoices belonging to linked students
  const parentInvoices = invoices.filter(
    (i) => i.parentId === currentParent.id || studentIds.includes(i.studentId)
  );

  const unpaidInvoices = parentInvoices.filter(
    (i) => i.status === 'UNPAID' || i.status === 'PENDING'
  );
  const overdueInvoices = parentInvoices.filter((i) => i.status === 'EXPIRED');
  const paidInvoices = parentInvoices.filter((i) => i.status === 'PAID');

  const totalUnpaidAmount = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalOverdueAmount = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-emerald-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-700/80 text-emerald-100 mb-2">
            <User className="w-3 h-3" />
            Portal Orang Tua / Wali Santri
          </span>
          <h2 className="text-xl font-black tracking-tight">
            Ahlan wa Sahlan, {currentParent.name}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-lg">
            Pantau rincian biaya SPP bulanan ananda, lakukan pembayaran online instan lewat Midtrans,
            dan unduh kwitansi resmi pesantren kapan saja.
          </p>
        </div>

        {totalOverdueAmount > 0 ? (
          <div className="bg-rose-600/90 border border-rose-400/40 p-4 rounded-xl text-left md:text-right">
            <span className="text-[11px] font-bold uppercase text-rose-100 block">
              Tunggakan SPP Ananda
            </span>
            <span className="text-xl font-black text-white block mt-0.5">
              {formatRupiah(totalOverdueAmount)}
            </span>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="mt-2 text-xs font-bold bg-white text-rose-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 hover:bg-rose-50 transition cursor-pointer"
            >
              Bayar Sekarang
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-emerald-700/60 border border-emerald-600 p-4 rounded-xl text-left md:text-right">
            <span className="text-[11px] font-semibold text-emerald-200 block">
              Status Tagihan SPP
            </span>
            <span className="text-lg font-bold text-white block mt-0.5">
              Semua Lancar / Terjadwal
            </span>
            <span className="text-[11px] text-emerald-200">Tidak ada tunggakan jatuh tempo</span>
          </div>
        )}
      </div>

      {/* Linked Children Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          Data Santri / Siswa Terhubung ({linkedStudents.length} Anak)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {linkedStudents.map((std) => {
            const studentInvs = parentInvoices.filter((i) => i.studentId === std.id);
            const activeInv = studentInvs.find((i) => i.status === 'UNPAID' || i.status === 'PENDING' || i.status === 'EXPIRED');
            const hasOverdue = studentInvs.some((i) => i.status === 'EXPIRED');

            return (
              <div
                key={std.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {std.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{std.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">NIS: {std.nis}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        std.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}
                    >
                      {std.gender === 'L' ? 'Putra' : 'Putri'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kelas:</span>
                      <span className="font-semibold text-slate-800">{std.className}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status Santri:</span>
                      <span className="font-bold text-emerald-700 uppercase">{std.status}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {activeInv ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tagihan Berjalan:</span>
                      <span className="text-xs font-bold text-slate-800">
                        {getMonthName(activeInv.month)} ({formatRupiah(activeInv.amount)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lunas Semua Bulan
                    </span>
                  )}

                  {activeInv && (
                    <button
                      onClick={() => onPayInvoice(activeInv)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Bayar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unpaid / Active Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Tagihan SPP Menunggu Pembayaran</h3>
            <p className="text-xs text-slate-400">
              Selesaikan pembayaran sebelum tanggal {schoolProfile.dueDay} setiap bulannya
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Tagihan
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">No. Invoice</th>
                <th className="py-2.5 px-3">Santri</th>
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3">Jatuh Tempo</th>
                <th className="py-2.5 px-3 text-right">Nominal</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unpaidInvoices.length === 0 && overdueInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Semua tagihan SPP ananda telah lunas. Jazakumullah khair.
                  </td>
                </tr>
              ) : (
                [...overdueInvoices, ...unpaidInvoices].map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {inv.studentName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {getMonthName(inv.month)} {inv.year}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatRupiah(inv.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'EXPIRED'
                            ? 'bg-rose-100 text-rose-800'
                            : inv.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {inv.status === 'EXPIRED' ? 'Tunggakan' : inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onPayInvoice(inv)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Bayar Online
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
