'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { SchoolProfile } from '@/types';
import {
  ShieldAlert,
  UserCheck,
  RefreshCw,
  School,
  Database,
  CreditCard,
  ChevronDown,
  Users,
} from 'lucide-react';

interface NavbarProps {
  schoolProfile: SchoolProfile;
  onResetData: () => void;
  isRefreshing?: boolean;
}

export function Navbar({ schoolProfile, onResetData, isRefreshing }: NavbarProps) {
  const { role, setRole, currentParent, setCurrentParent, availableParents, userName } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-slate-900">
                  {schoolProfile.name}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SPP Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sistem Pembayaran SPP Bulanan Terintegrasi Midtrans
              </p>
            </div>
          </div>

          {/* Center/Right: Role Switcher & Badges */}
          <div className="flex items-center gap-3">
            {/* System Status Badges */}
            <div className="hidden lg:flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Database className="w-3 h-3 text-slate-400" />
                Firestore
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                <CreditCard className="w-3 h-3 text-blue-500" />
                Midtrans Sandbox
              </span>
            </div>

            {/* Parent Account Selector (Only shown if Parent role is active) */}
            {role === 'parent' && (
              <div className="relative">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium hidden sm:inline">Pilih Akun Wali:</span>
                  <select
                    value={currentParent?.id || ''}
                    onChange={(e) => {
                      const found = availableParents.find((p) => p.id === e.target.value);
                      if (found) setCurrentParent(found);
                    }}
                    className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    {availableParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.studentIds.length} santri)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Role Switcher Button */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  role === 'admin'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  role === 'parent'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Orang Tua/Wali</span>
              </button>
            </div>

            {/* Reset Dummy Data Button */}
            <button
              onClick={onResetData}
              title="Reset ke Data Dummy Awal"
              disabled={isRefreshing}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
