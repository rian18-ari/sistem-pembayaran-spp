'use client';

import React, { useState } from 'react';
import { ClassItem, Student } from '@/types';
import { GraduationCap, Plus, Users, Calendar } from 'lucide-react';

interface AdminClassesViewProps {
  classes: ClassItem[];
  students: Student[];
  onAddClass: (classData: Omit<ClassItem, 'id' | 'createdAt'>) => Promise<any>;
}

export function AdminClassesView({
  classes,
  students,
  onAddClass,
}: AdminClassesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('7');
  const [academicYear, setAcademicYear] = useState('2024/2025');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddClass({
      name,
      grade,
      academicYear,
    });
    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Data Kelas</h2>
          <p className="text-xs text-slate-500">
            Daftar tingkatan kelas, rombongan belajar, dan tahun ajaran
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Rombel / Kelas
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const studentCount = students.filter((s) => s.classId === cls.id).length;
          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                  Tingkat {cls.grade}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{cls.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tahun Ajaran {cls.academicYear}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Jumlah Santri:
                </span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                  {studentCount} anak
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Tambah Kelas Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas VII-C (Tahfidz Putra)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat / Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="7">Kelas 7</option>
                    <option value="8">Kelas 8</option>
                    <option value="9">Kelas 9</option>
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
