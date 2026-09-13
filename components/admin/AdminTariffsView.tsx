'use client';

import React, { useState } from 'react';
import { SppSetting, ClassItem } from '@/types';
import { formatRupiah } from '@/lib/format';
import { BadgePercent, Edit3, Calendar, CheckCircle2 } from 'lucide-react';

interface AdminTariffsViewProps {
  sppSettings: SppSetting[];
  classes: ClassItem[];
  onUpdateTariff: (id: string, monthlyFee: number, description?: string) => Promise<any>;
}

export function AdminTariffsView({
  sppSettings,
  classes,
  onUpdateTariff,
}: AdminTariffsViewProps) {
  const [editingSetting, setEditingSetting] = useState<SppSetting | null>(null);
  const [newFee, setNewFee] = useState<number>(0);
  const [newDesc, setNewDesc] = useState<string>('');

  const openEditModal = (item: SppSetting) => {
    setEditingSetting(item);
    setNewFee(item.monthlyFee);
    setNewDesc(item.description || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSetting) return;
    await onUpdateTariff(editingSetting.id, newFee, newDesc);
    setEditingSetting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengaturan Tarif SPP</h2>
          <p className="text-xs text-slate-500">
            Konfigurasi besaran nominal SPP bulanan per rombel kelas dan tahun ajaran
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sppSettings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <BadgePercent className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  TA {item.academicYear}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{item.className}</h3>
              <p className="text-xs text-slate-500 mb-4 min-h-[36px]">
                {item.description || 'Komponen SPP reguler dan asrama pondok'}
              </p>
            </div>

            <div>
              <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between mb-4">
                <span className="text-xs text-slate-400 font-medium">Tarif / Bulan:</span>
                <span className="text-xl font-extrabold text-emerald-700">
                  {formatRupiah(item.monthlyFee)}
                </span>
              </div>

              <button
                onClick={() => openEditModal(item)}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Ubah Nominal Tarif
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingSetting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Ubah Tarif: {editingSetting.className}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Perubahan tarif akan berlaku untuk tagihan baru yang digenerate selanjutnya.
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal SPP Bulanan (Rupiah)
                </label>
                <input
                  type="number"
                  required
                  step="5000"
                  value={newFee}
                  onChange={(e) => setNewFee(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan / Komponen Biaya
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSetting(null)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
