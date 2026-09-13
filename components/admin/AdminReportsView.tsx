'use client';

import React, { useState } from 'react';
import { Invoice, ClassItem, SchoolProfile } from '@/types';
import { formatRupiah, getMonthName, INDO_MONTHS, formatDateIndo } from '@/lib/format';
import { Printer, BarChart3, Filter, FileSpreadsheet, CheckCircle } from 'lucide-react';

interface AdminReportsViewProps {
  invoices: Invoice[];
  classes: ClassItem[];
  schoolProfile: SchoolProfile;
}

export function AdminReportsView({
  invoices,
  classes,
  schoolProfile,
}: AdminReportsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filtered = invoices.filter((inv) => {
    const matchYear = inv.year === selectedYear;
    const matchMonth = selectedMonth === 'ALL' || inv.month === Number(selectedMonth);
    const matchClass = selectedClass === 'ALL' || inv.classId === selectedClass;
    const matchStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchYear && matchMonth && matchClass && matchStatus;
  });

  const totalTarget = filtered.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRealized = filtered
    .filter((i) => i.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalUnpaid = totalTarget - totalRealized;
  const achievementRate = totalTarget > 0 ? Math.round((totalRealized / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Laporan Rekapitulasi Pembayaran SPP</h2>
          <p className="text-xs text-slate-500">
            Penyaringan laporan keuangan SPP berdasarkan bulan, tahun, kelas, dan status
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak Dokumen Laporan
        </button>
      </div>

      {/* Filter Toolbar (hidden on print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
            >
              <option value="ALL">Semua Bulan</option>
              {INDO_MONTHS.slice(1).map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Status Pembayaran</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="PAID">PAID (Lunas)</option>
              <option value="UNPAID">UNPAID (Belum Bayar)</option>
              <option value="PENDING">PENDING</option>
              <option value="EXPIRED">EXPIRED (Tunggakan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 text-center">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
            {schoolProfile.name}
          </h2>
          <p className="text-xs text-slate-500">
            {schoolProfile.address} • Telp: {schoolProfile.phone}
          </p>
          <div className="mt-3 py-1 bg-slate-100 rounded-lg inline-block px-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Laporan Realisasi Penerimaan SPP Bulanan
            </h3>
            <p className="text-[11px] text-slate-600">
              Periode:{' '}
              {selectedMonth === 'ALL'
                ? `Tahun ${selectedYear}`
                : `${INDO_MONTHS[Number(selectedMonth)]} ${selectedYear}`}{' '}
              • Kelas:{' '}
              {selectedClass === 'ALL'
                ? 'Semua Kelas'
                : classes.find((c) => c.id === selectedClass)?.name}
            </p>
          </div>
        </div>

        {/* 4 Financial Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Target SPP
            </span>
            <span className="text-base font-extrabold text-slate-900 block mt-1">
              {formatRupiah(totalTarget)}
            </span>
            <span className="text-[10px] text-slate-400">{filtered.length} invoice</span>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">
              Realisasi Pembayaran
            </span>
            <span className="text-base font-extrabold text-emerald-700 block mt-1">
              {formatRupiah(totalRealized)}
            </span>
            <span className="text-[10px] text-emerald-600">Capaian: {achievementRate}%</span>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">
              Belum Tertagih
            </span>
            <span className="text-base font-extrabold text-amber-700 block mt-1">
              {formatRupiah(totalUnpaid)}
            </span>
            <span className="text-[10px] text-amber-600">
              {filtered.filter((i) => i.status !== 'PAID').length} invoice
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Persentase Capaian
            </span>
            <span className="text-base font-extrabold text-slate-800 block mt-1">
              {achievementRate}%
            </span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${achievementRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Table of Report Items */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">No. Invoice</th>
                <th className="py-2.5 px-3">NIS</th>
                <th className="py-2.5 px-3">Nama Santri</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3 text-right">Tarif</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Tgl Lunas</th>
                <th className="py-2.5 px-3">Metode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-slate-400">
                    Tidak ada data yang sesuai filter laporan.
                  </td>
                </tr>
              ) : (
                filtered.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{inv.studentNis}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{inv.studentName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{inv.className}</td>
                    <td className="py-2.5 px-3 text-slate-600">{getMonthName(inv.month)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatRupiah(inv.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'EXPIRED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {inv.paidAt ? formatDateIndo(inv.paidAt) : '-'}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[11px] text-slate-500">
                      {inv.paymentMethod || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Signature Box (visible on print) */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end text-xs">
          <div className="text-right">
            <p className="text-slate-500">Bogor, {formatDateIndo(new Date().toISOString())}</p>
            <p className="text-slate-500 mt-0.5">Bendahara Keuangan,</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 underline decoration-slate-400 underline-offset-4">
              {schoolProfile.treasurerName}
            </p>
            <p className="text-[10px] text-slate-400">NIP/NIY: 19840815.201001.1.002</p>
          </div>
        </div>
      </div>
    </div>
  );
}
