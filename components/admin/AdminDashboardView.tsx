'use client';

import React from 'react';
import { Invoice, PaymentAttempt, Student, ClassItem } from '@/types';
import { formatRupiah, formatDateTimeIndo, getMonthName } from '@/lib/format';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  FileSpreadsheet,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AdminDashboardViewProps {
  invoices: Invoice[];
  payments: PaymentAttempt[];
  students: Student[];
  classes: ClassItem[];
  onOpenGenerateModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export function AdminDashboardView({
  invoices,
  payments,
  students,
  classes,
  onOpenGenerateModal,
  onNavigateTab,
}: AdminDashboardViewProps) {
  // Calculations
  const totalInvoicesAmount = invoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  const paidInvoices = invoices.filter((i) => i.status === 'PAID');
  const totalPaidAmount = paidInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const unpaidInvoices = invoices.filter((i) => i.status === 'UNPAID' || i.status === 'PENDING');
  const totalUnpaidAmount = unpaidInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const arrearsInvoices = invoices.filter((i) => i.status === 'EXPIRED');
  const totalArrearsAmount = arrearsInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Percentage collection
  const collectionRate = totalInvoicesAmount > 0 
    ? Math.round((totalPaidAmount / totalInvoicesAmount) * 100) 
    : 0;

  // Monthly Chart Data (Juli, Agustus, September, Oktober 2024)
  const monthList = [7, 8, 9, 10];
  const chartData = monthList.map((m) => {
    const monthInvs = invoices.filter((i) => i.month === m);
    const target = monthInvs.reduce((sum, i) => sum + i.amount, 0);
    const realized = monthInvs
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      month: getMonthName(m),
      Target: target,
      Realisasi: realized,
    };
  });

  // Payment method distribution
  const methodCounts: Record<string, number> = {};
  paidInvoices.forEach((inv) => {
    const method = inv.paymentMethod || 'Lainnya';
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  });

  const pieData = Object.entries(methodCounts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));

  const PIE_COLORS = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#db2777'];

  // Latest 5 settled payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-800 text-white rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-black tracking-tight">Dashboard Bendahara SPP</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Ringkasan keuangan, tagihan bulanan santri, dan rekonsiliasi Midtrans Payment Gateway.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGenerateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            Generate Tagihan Baru
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Laporan
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tagihan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Tagihan
            </span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatRupiah(totalInvoicesAmount)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            <span>{invoices.length} invoice terdaftar</span>
          </div>
        </div>

        {/* Total Pembayaran (Lunas) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Total Pembayaran
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-700">
            {formatRupiah(totalPaidAmount)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-700 font-medium">
            <span className="bg-emerald-100 px-1.5 py-0.5 rounded text-[11px] font-bold">
              {collectionRate}%
            </span>
            <span>dari target tertagih</span>
          </div>
        </div>

        {/* Total Belum Dibayar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Belum Dibayar
            </span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-700">
            {formatRupiah(totalUnpaidAmount)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            <span>{unpaidInvoices.length} invoice aktif</span>
          </div>
        </div>

        {/* Total Tunggakan (Expired) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Total Tunggakan
            </span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-700">
            {formatRupiah(totalArrearsAmount)}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-500">{arrearsInvoices.length} santri lewat jatuh tempo</span>
            <button
              onClick={() => onNavigateTab('arrears')}
              className="text-rose-600 font-bold hover:underline"
            >
              Lihat →
            </button>
          </div>
        </div>
      </div>

      {/* Visualizer Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Grafik Pembayaran SPP Bulanan</h3>
              <p className="text-xs text-slate-400">Target Tagihan vs Realisasi Pembayaran Masuk</p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              TA 2024/2025
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `Rp${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realisasi" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Metode Pembayaran</h3>
            <p className="text-xs text-slate-400 mb-4">Distribusi channel pembayaran santri</p>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: 'QRIS', value: 1 }]}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  ></span>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value} transaksi</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Pembayaran Terbaru</h3>
            <p className="text-xs text-slate-400">Transaksi masuk yang tercatat di sistem</p>
          </div>
          <button
            onClick={() => onNavigateTab('payments')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Riwayat
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Order ID / No. Invoice</th>
                <th className="py-2.5 px-3">Santri / Siswa</th>
                <th className="py-2.5 px-3">Metode</th>
                <th className="py-2.5 px-3 text-right">Nominal</th>
                <th className="py-2.5 px-3">Waktu Transaksi</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Belum ada pembayaran yang tercatat.
                  </td>
                </tr>
              ) : (
                recentPayments.map((pay) => {
                  const inv = invoices.find((i) => i.id === pay.invoiceId);
                  const isSettled = pay.transactionStatus === 'settlement';
                  const isExpire = pay.transactionStatus === 'expire';

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-800">{pay.orderId}</span>
                        <span className="block text-[10px] text-slate-400">
                          {pay.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">
                          {inv ? inv.studentName : 'Santri'}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {inv ? inv.className : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-slate-600 font-medium">
                        {pay.paymentType || 'Midtrans'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatRupiah(pay.amount)}
                      </td>
                      <td className="py-3 px-3 text-slate-500" suppressHydrationWarning>
                        {formatDateTimeIndo(pay.settlementTime || pay.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isSettled
                              ? 'bg-emerald-100 text-emerald-800'
                              : isExpire
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pay.transactionStatus}
                        </span>
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
