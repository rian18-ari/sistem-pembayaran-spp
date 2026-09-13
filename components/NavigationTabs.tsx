'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BadgePercent,
  FileText,
  CreditCard,
  AlertOctagon,
  BarChart3,
  Settings,
  Receipt,
  History,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'tariffs'
  | 'invoices'
  | 'payments'
  | 'arrears'
  | 'reports'
  | 'settings';

export type ParentTab =
  | 'dashboard'
  | 'invoices'
  | 'payments'
  | 'history'
  | 'receipts';

interface NavigationTabsProps {
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  parentTab: ParentTab;
  setParentTab: (tab: ParentTab) => void;
  arrearsCount?: number;
  unpaidCount?: number;
}

export function NavigationTabs({
  adminTab,
  setAdminTab,
  parentTab,
  setParentTab,
  arrearsCount = 0,
  unpaidCount = 0,
}: NavigationTabsProps) {
  const { role } = useAuth();

  const adminNavItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as AdminTab, label: 'Siswa', icon: Users },
    { id: 'classes' as AdminTab, label: 'Kelas', icon: GraduationCap },
    { id: 'tariffs' as AdminTab, label: 'Tarif SPP', icon: BadgePercent },
    { id: 'invoices' as AdminTab, label: 'Tagihan', icon: FileText },
    { id: 'payments' as AdminTab, label: 'Pembayaran', icon: CreditCard },
    {
      id: 'arrears' as AdminTab,
      label: 'Tunggakan',
      icon: AlertOctagon,
      badge: arrearsCount > 0 ? arrearsCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'reports' as AdminTab, label: 'Laporan', icon: BarChart3 },
    { id: 'settings' as AdminTab, label: 'Pengaturan', icon: Settings },
  ];

  const parentNavItems = [
    { id: 'dashboard' as ParentTab, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'invoices' as ParentTab,
      label: 'Tagihan',
      icon: FileText,
      badge: unpaidCount > 0 ? unpaidCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'payments' as ParentTab, label: 'Pembayaran', icon: CreditCard },
    { id: 'history' as ParentTab, label: 'Riwayat Transaksi', icon: History },
    { id: 'receipts' as ParentTab, label: 'Bukti Pembayaran', icon: Receipt },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {role === 'admin'
            ? adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminTab(item.id)}
                    className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          item.badgeColor || 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            : parentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = parentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setParentTab(item.id)}
                    className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          item.badgeColor || 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
        </nav>
      </div>
    </div>
  );
}
