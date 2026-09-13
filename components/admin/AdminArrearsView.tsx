'use client';

import React, { useState } from 'react';
import { Invoice, Student, SchoolProfile } from '@/types';
import { formatRupiah, getMonthName } from '@/lib/format';
import { AlertOctagon, MessageSquare, Printer, Search, ArrowUpRight, Phone } from 'lucide-react';

interface AdminArrearsViewProps {
  invoices: Invoice[];
  students: Student[];
  schoolProfile: SchoolProfile;
}

export function AdminArrearsView({
  invoices,
  students,
  schoolProfile,
}: AdminArrearsViewProps) {
  const [search, setSearch] = useState('');

  // Collect invoices that are overdue (status === 'EXPIRED' or UNPAID with dueDate passed)
  const overdueInvoices = invoices.filter((i) => i.status === 'EXPIRED');

  // Group by student
  const studentArrearsMap = new Map<
    string,
    {
      student: Student | undefined;
      studentName: string;
      className: string;
      parentName: string;
      parentPhone: string;
      invoices: Invoice[];
      totalAmount: number;
    }
  >();

  overdueInvoices.forEach((inv) => {
    const std = students.find((s) => s.id === inv.studentId);
    const key = inv.studentId;
    if (!studentArrearsMap.has(key)) {
      studentArrearsMap.set(key, {
        student: std,
        studentName: inv.studentName,
        className: inv.className,
        parentName: inv.parentName,
        parentPhone: std?.parentPhone || '081234567890',
        invoices: [],
        totalAmount: 0,
      });
    }
    const record = studentArrearsMap.get(key)!;
    record.invoices.push(inv);
    record.totalAmount += inv.amount;
  });

  const arrearsList = Array.from(studentArrearsMap.values()).filter((item) => {
    return (
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.parentName.toLowerCase().includes(search.toLowerCase()) ||
      item.className.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalAllArrears = arrearsList.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Send polite WhatsApp reminder to parent
  const sendWhatsAppReminder = (item: typeof arrearsList[0]) => {
    const monthsStr = item.invoices
      .map((i) => `${getMonthName(i.month)} ${i.year} (${formatRupiah(i.amount)})`)
      .join(', ');

    const phoneClean = item.parentPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');

    const message = encodeURIComponent(
      `*PEMBERITAHUAN TUNGGAKAN SPP - ${schoolProfile.name.toUpperCase()}*\n\n` +
      `Assalamu'alaikum Wr. Wb.\n` +
      `Kepada Yth. *${item.parentName}*,\n` +
      `Wali dari santri/siswa: *${item.studentName}* (${item.className})\n\n` +
      `Semoga Bapak/Ibu senantiasa dalam limpahan berkah dan kesehatan.\n\n` +
      `Kami menginformasikan bahwa ananda saat ini tercatat memiliki tunggakan pembayaran SPP dengan rincian sbb:\n` +
      `• Periode: *${monthsStr}*\n` +
      `• Total Tunggakan: *${formatRupiah(item.totalAmount)}*\n\n` +
      `Pembayaran dapat diselesaikan secara online melalui Portal SPP (didukung QRIS & Virtual Account Midtrans) atau transfer ke rekening yayasan:\n` +
      `*${schoolProfile.bankAccounts[0]?.bankName}: ${schoolProfile.bankAccounts[0]?.accountNumber}* a.n ${schoolProfile.bankAccounts[0]?.accountHolder}\n\n` +
      `Mohon konfirmasi ke Bagian Keuangan setelah melakukan pembayaran. Terima kasih atas kerja sama dan perhatian Bapak/Ibu.\n\n` +
      `Wassalamu'alaikum Wr. Wb.\n` +
      `_Bendahara Keuangan ${schoolProfile.name}_`
    );

    window.open(`https://wa.me/${phoneClean}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Daftar Tunggakan SPP</h2>
          <p className="text-xs text-slate-500">
            Monitoring santri yang belum menyelesaikan kewajiban SPP yang telah jatuh tempo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Cetak Rekap Tunggakan
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-950">
          <span className="text-xs font-bold uppercase text-rose-700">Total Nilai Tunggakan</span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {formatRupiah(totalAllArrears)}
          </div>
          <p className="text-[11px] text-rose-600 mt-1">
            Dari {overdueInvoices.length} tagihan yang telah lewat jatuh tempo
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold uppercase text-slate-400">Santri Menunggak</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {arrearsList.length} Santri
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Membutuhkan tindak lanjut pengingat
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <span className="text-xs font-bold uppercase text-slate-400">Jatuh Tempo Bulanan</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            Tanggal {schoolProfile.dueDay}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Batas waktu setiap bulannya
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari santri menunggak berdasarkan nama, kelas, atau wali..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Santri / Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Orang Tua / Wali</th>
                <th className="py-3 px-4">Bulan Menunggak</th>
                <th className="py-3 px-4 text-right">Total Tunggakan</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {arrearsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Alhamdulillah, tidak ada santri yang memiliki tunggakan.
                  </td>
                </tr>
              ) : (
                arrearsList.map((item) => (
                  <tr key={item.studentName} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-sm">
                        {item.studentName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        NIS: {item.student?.nis || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {item.className}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {item.parentName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {item.parentPhone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.invoices.map((inv) => (
                          <span
                            key={inv.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800"
                          >
                            {getMonthName(inv.month)} {inv.year}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-700 text-sm">
                      {formatRupiah(item.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => sendWhatsAppReminder(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                        title="Kirim pesan WhatsApp otomatis ke wali santri"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Kirim WA
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
