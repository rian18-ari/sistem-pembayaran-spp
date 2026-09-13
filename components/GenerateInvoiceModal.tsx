'use client';

import React, { useState } from 'react';
import { ClassItem } from '@/types';
import { INDO_MONTHS } from '@/lib/format';
import { Calendar, Layers, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';

interface GenerateInvoiceModalProps {
  classes: ClassItem[];
  onClose: () => void;
  onGenerate: (params: {
    classId: string;
    month: number;
    year: number;
    academicYear: string;
    dueDate: string;
  }) => Promise<{ generatedCount: number; skippedCount: number }>;
}

export function GenerateInvoiceModal({
  classes,
  onClose,
  onGenerate,
}: GenerateInvoiceModalProps) {
  const currentDate = new Date();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [academicYear, setAcademicYear] = useState<string>('2024/2025');
  const [dueDate, setDueDate] = useState<string>(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-10`
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ generatedCount: number; skippedCount: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await onGenerate({
        classId: selectedClassId,
        month,
        year,
        academicYear,
        dueDate,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Generate Tagihan SPP Bulanan</h3>
              <p className="text-xs text-slate-500">Buat tagihan massal untuk santri/siswa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success Result */}
        {result ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">
              Proses Generate Selesai
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Pengecekan anti-duplikasi telah dijalankan secara otomatis.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-left space-y-2">
              <div className="flex justify-between items-center text-emerald-700 font-semibold">
                <span>Tagihan Baru Dibuat:</span>
                <span className="text-sm font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                  +{result.generatedCount} siswa
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Dilewati (Sudah Ada Tagihan):</span>
                <span className="font-mono">{result.skippedCount} siswa</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 border-t border-slate-200 pt-2">
                <span>Periode:</span>
                <span className="font-medium text-slate-700">
                  {INDO_MONTHS[month]} {year}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer"
            >
              Kembali ke Daftar Tagihan
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Target Kelas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Kelas
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Kelas (Seluruh Siswa Aktif)</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.academicYear})
                  </option>
                ))}
              </select>
            </div>

            {/* Bulan & Tahun */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bulan Tagihan
                </label>
                <select
                  value={month}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setMonth(m);
                    setDueDate(`${year}-${String(m).padStart(2, '0')}-10`);
                  }}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {INDO_MONTHS.slice(1).map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {mName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tahun Kalender
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setYear(y);
                    setDueDate(`${y}-${String(month).padStart(2, '0')}-10`);
                  }}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Tahun Ajaran & Jatuh Tempo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2024/2025"
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batas Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Notice Anti-Duplikasi */}
            <div className="flex items-start gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200/60 p-3 rounded-xl text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Sistem Anti-Duplikasi Aktif:</strong> Siswa yang sudah memiliki tagihan
                pada bulan dan tahun yang sama tidak akan digenerate ulang (mencegah tagihan ganda).
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Generate Tagihan'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
