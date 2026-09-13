'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useSppData } from '@/hooks/useSppData';
import { Invoice } from '@/types';

// Modals
import { MidtransPayModal } from '@/components/MidtransPayModal';
import { GenerateInvoiceModal } from '@/components/GenerateInvoiceModal';
import { PaymentReceiptModal } from '@/components/PaymentReceiptModal';

// Shared UI
import { Navbar } from '@/components/Navbar';
import { NavigationTabs, AdminTab, ParentTab } from '@/components/NavigationTabs';

// Admin Views
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { AdminStudentsView } from '@/components/admin/AdminStudentsView';
import { AdminClassesView } from '@/components/admin/AdminClassesView';
import { AdminTariffsView } from '@/components/admin/AdminTariffsView';
import { AdminInvoicesView } from '@/components/admin/AdminInvoicesView';
import { AdminPaymentsView } from '@/components/admin/AdminPaymentsView';
import { AdminArrearsView } from '@/components/admin/AdminArrearsView';
import { AdminReportsView } from '@/components/admin/AdminReportsView';
import { AdminSettingsView } from '@/components/admin/AdminSettingsView';

// Parent Views
import { ParentDashboardView } from '@/components/parent/ParentDashboardView';
import { ParentInvoicesView } from '@/components/parent/ParentInvoicesView';
import { ParentPaymentsGuideView } from '@/components/parent/ParentPaymentsGuideView';
import { ParentHistoryView } from '@/components/parent/ParentHistoryView';
import { ParentReceiptsView } from '@/components/parent/ParentReceiptsView';

function MainAppContent() {
  const { role, currentParent } = useAuth();
  const spp = useSppData();

  // Navigation tab states
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [parentTab, setParentTab] = useState<ParentTab>('dashboard');

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Arrears count for Admin badge
  const arrearsCount = spp.invoices.filter((i) => i.status === 'EXPIRED').length;

  // Unpaid count for Parent badge
  const parentStudentIds = spp.students
    .filter((s) => s.parentId === currentParent?.id || currentParent?.studentIds?.includes(s.id))
    .map((s) => s.id);

  const parentInvoices = spp.invoices.filter(
    (i) => i.parentId === currentParent?.id || parentStudentIds.includes(i.studentId)
  );

  const parentUnpaidCount = parentInvoices.filter(
    (i) => i.status === 'UNPAID' || i.status === 'PENDING' || i.status === 'EXPIRED'
  ).length;

  const parentPayments = spp.payments.filter((p) => {
    const inv = spp.invoices.find((i) => i.id === p.invoiceId);
    return inv && (inv.parentId === currentParent?.id || parentStudentIds.includes(inv.studentId));
  });

  const parentPaidInvoices = parentInvoices.filter((i) => i.status === 'PAID');

  const handleResetData = async () => {
    await spp.resetToDemoData();
    showToast('Data dummy pesantren berhasil diisi ulang.');
  };

  const handlePaymentSuccess = () => {
    spp.refreshData();
    showToast('Pembayaran berhasil diverifikasi! Tagihan telah LUNAS.');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-200">
      {/* Top Navbar with Role Toggle */}
      <Navbar
        schoolProfile={spp.schoolProfile}
        onResetData={handleResetData}
        isRefreshing={spp.loading}
      />

      {/* Navigation Subbar */}
      <NavigationTabs
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        parentTab={parentTab}
        setParentTab={setParentTab}
        arrearsCount={arrearsCount}
        unpaidCount={parentUnpaidCount}
      />

      {/* Toast notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {role === 'admin' ? (
          /* ================= ADMIN ROLE VIEWS ================= */
          <div>
            {adminTab === 'dashboard' && (
              <AdminDashboardView
                invoices={spp.invoices}
                payments={spp.payments}
                students={spp.students}
                classes={spp.classes}
                onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
                onNavigateTab={(t) => setAdminTab(t)}
              />
            )}

            {adminTab === 'students' && (
              <AdminStudentsView
                students={spp.students}
                classes={spp.classes}
                parents={spp.parents}
                onAddStudent={async (d) => {
                  await spp.addStudent(d);
                  showToast('Santri baru berhasil ditambahkan.');
                }}
                onUpdateStudent={async (id, d) => {
                  await spp.updateStudent(id, d);
                  showToast('Data santri berhasil diperbarui.');
                }}
                onDeleteStudent={async (id) => {
                  await spp.deleteStudent(id);
                  showToast('Data santri telah dihapus.');
                }}
              />
            )}

            {adminTab === 'classes' && (
              <AdminClassesView
                classes={spp.classes}
                students={spp.students}
                onAddClass={async (d) => {
                  await spp.addClass(d);
                  showToast('Rombel kelas baru berhasil disimpan.');
                }}
              />
            )}

            {adminTab === 'tariffs' && (
              <AdminTariffsView
                sppSettings={spp.sppSettings}
                classes={spp.classes}
                onUpdateTariff={async (id, fee, desc) => {
                  await spp.updateSppTariff(id, fee, desc);
                  showToast('Nominal tarif SPP berhasil diubah.');
                }}
              />
            )}

            {adminTab === 'invoices' && (
              <AdminInvoicesView
                invoices={spp.invoices}
                payments={spp.payments}
                classes={spp.classes}
                onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
                onMarkPaidManual={async (invId) => {
                  await spp.markInvoicePaidManual(invId);
                  showToast('Tagihan berhasil ditandai LUNAS via Kasir Tunai.');
                }}
                onViewReceipt={(inv) => setReceiptInvoice(inv)}
                onPayOnline={(inv) => setPayInvoice(inv)}
              />
            )}

            {adminTab === 'payments' && (
              <AdminPaymentsView
                payments={spp.payments}
                invoices={spp.invoices}
                onViewReceipt={(inv) => setReceiptInvoice(inv)}
              />
            )}

            {adminTab === 'arrears' && (
              <AdminArrearsView
                invoices={spp.invoices}
                students={spp.students}
                schoolProfile={spp.schoolProfile}
              />
            )}

            {adminTab === 'reports' && (
              <AdminReportsView
                invoices={spp.invoices}
                classes={spp.classes}
                schoolProfile={spp.schoolProfile}
              />
            )}

            {adminTab === 'settings' && (
              <AdminSettingsView
                schoolProfile={spp.schoolProfile}
                invoices={spp.invoices}
                onResetData={handleResetData}
                onRefreshData={spp.refreshData}
              />
            )}
          </div>
        ) : (
          /* ================= ORANG TUA / WALI ROLE VIEWS ================= */
          <div>
            {parentTab === 'dashboard' && (
              <ParentDashboardView
                currentParent={currentParent}
                students={spp.students}
                invoices={spp.invoices}
                payments={spp.payments}
                schoolProfile={spp.schoolProfile}
                onPayInvoice={(inv) => setPayInvoice(inv)}
                onViewReceipt={(inv) => setReceiptInvoice(inv)}
                onNavigateTab={(t) => setParentTab(t)}
              />
            )}

            {parentTab === 'invoices' && (
              <ParentInvoicesView
                invoices={parentInvoices}
                students={spp.students.filter(
                  (s) => s.parentId === currentParent?.id || currentParent?.studentIds?.includes(s.id)
                )}
                onPayInvoice={(inv) => setPayInvoice(inv)}
                onViewReceipt={(inv) => setReceiptInvoice(inv)}
              />
            )}

            {parentTab === 'payments' && (
              <ParentPaymentsGuideView
                schoolProfile={spp.schoolProfile}
                onGoToInvoices={() => setParentTab('invoices')}
              />
            )}

            {parentTab === 'history' && (
              <ParentHistoryView
                payments={parentPayments}
                invoices={spp.invoices}
                onViewReceipt={(inv) => setReceiptInvoice(inv)}
              />
            )}

            {parentTab === 'receipts' && (
              <ParentReceiptsView
                paidInvoices={parentPaidInvoices}
                onViewReceipt={(inv) => setReceiptInvoice(inv)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            &copy; 2024-2025 <strong>{spp.schoolProfile.name}</strong> • Bagian Keuangan &amp; SPP
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Powered by Midtrans Payment Gateway &amp; Firebase Firestore</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}

      {/* 1. Generate Invoice Massal Modal */}
      {isGenerateModalOpen && (
        <GenerateInvoiceModal
          classes={spp.classes}
          onClose={() => setIsGenerateModalOpen(false)}
          onGenerate={async (invoicesToCreate) => {
            const res = await spp.generateMonthlyInvoices(invoicesToCreate);
            showToast(`Berhasil menerbitkan ${res.generatedCount} tagihan SPP baru.`);
            return res;
          }}
        />
      )}

      {/* 2. Midtrans Pay Modal */}
      {payInvoice && (
        <MidtransPayModal
          invoice={payInvoice}
          parentName={currentParent?.name || 'Wali Santri'}
          parentEmail={currentParent?.email || 'wali@darulilmi.sch.id'}
          parentPhone={currentParent?.phone || '081234567890'}
          onClose={() => setPayInvoice(null)}
          onPaymentSuccess={() => {
            handlePaymentSuccess();
          }}
          onViewReceipt={(inv) => {
            setPayInvoice(null);
            setReceiptInvoice(inv);
          }}
        />
      )}

      {/* 3. Payment Receipt Modal */}
      {receiptInvoice && (
        <PaymentReceiptModal
          invoice={receiptInvoice}
          schoolProfile={spp.schoolProfile}
          onClose={() => setReceiptInvoice(null)}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
