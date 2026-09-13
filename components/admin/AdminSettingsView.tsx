'use client';

import React, { useState } from 'react';
import { SchoolProfile, Invoice } from '@/types';
import { formatRupiah, getMonthName } from '@/lib/format';
import {
  Settings,
  School,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Check,
  Activity,
  Send,
  ExternalLink,
  Code,
  CheckCircle2,
} from 'lucide-react';

interface AdminSettingsViewProps {
  schoolProfile: SchoolProfile;
  invoices?: Invoice[];
  onResetData: () => void;
  onRefreshData?: () => void;
}

export function AdminSettingsView({
  schoolProfile,
  invoices = [],
  onResetData,
  onRefreshData,
}: AdminSettingsViewProps) {
  const [copied, setCopied] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);

  // Webhook Simulator State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoices.find((i) => i.status !== 'PAID')?.id || invoices[0]?.id || ''
  );
  const [targetStatus, setTargetStatus] = useState<string>('settlement');
  const [paymentType, setPaymentType] = useState<string>('qris');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<any>(null);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/midtrans/webhook`
      : 'https://your-app-domain.com/api/midtrans/webhook';

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePingWebhook = async () => {
    setPingLoading(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/midtrans/webhook', { method: 'GET' });
      const data = await res.json();
      setPingResult({
        status: res.status,
        ok: res.ok,
        data,
      });
    } catch (err: any) {
      setPingResult({
        status: 500,
        ok: false,
        error: err.message || 'Gagal menghubungi webhook endpoint',
      });
    } finally {
      setPingLoading(false);
    }
  };

  const handleSimulateWebhook = async () => {
    const inv = invoices.find((i) => i.id === selectedInvoiceId);
    if (!inv) {
      alert('Pilih invoice terlebih dahulu untuk simulasi webhook.');
      return;
    }

    setIsSimulating(true);
    setSimulationLog(null);

    try {
      const orderId = `SPP-${inv.invoiceNumber}-${Date.now().toString().slice(-6)}`;
      const res = await fetch('/api/midtrans/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          targetStatus,
          paymentType,
          invoiceId: inv.id,
        }),
      });

      const data = await res.json();
      setSimulationLog({
        timestamp: new Date().toLocaleTimeString('id-ID'),
        httpStatus: res.status,
        success: res.ok,
        data,
      });

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err: any) {
      setSimulationLog({
        timestamp: new Date().toLocaleTimeString('id-ID'),
        httpStatus: 500,
        success: false,
        error: err.message || 'Simulasi webhook gagal',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pengaturan Sistem &amp; Integrasi Midtrans</h2>
        <p className="text-xs text-slate-500">
          Konfigurasi profil lembaga, endpoint Webhook Midtrans, dan pengujian gateway otomatis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Sekolah / Pesantren */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Profil Lembaga / Pesantren</h3>
              <p className="text-xs text-slate-400">Identitas resmi pada kwitansi &amp; kuitansi SPP</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-0.5">Nama Sekolah / Pesantren</label>
              <div className="font-semibold text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                {schoolProfile.name}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-0.5">Alamat Lengkap</label>
              <div className="text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                {schoolProfile.address}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-0.5">Kontak / Telepon</label>
                <div className="text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {schoolProfile.phone}
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-0.5">Email Bendahara</label>
                <div className="text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {schoolProfile.email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-0.5">Bendahara Penanggung Jawab</label>
                <div className="font-semibold text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {schoolProfile.treasurerName}
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-0.5">Default Tanggal Jatuh Tempo</label>
                <div className="font-semibold text-emerald-700 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  Tanggal {schoolProfile.dueDay} Setiap Bulan
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Midtrans Configuration Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Endpoint Webhook Midtrans</h3>
                <p className="text-xs text-slate-400">Notifikasi HTTP real-time status pembayaran</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
              AKTIF
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Notification URL (Webhook):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={copyWebhook}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'Salin'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Salin dan masukkan URL ini ke Dashboard Midtrans &gt; <strong>Settings &gt; Configuration &gt; Payment Notification URL</strong>.
              </p>
            </div>

            {/* Health Check Ping Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePingWebhook}
                disabled={pingLoading}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Activity className="w-4 h-4 text-blue-600" />
                {pingLoading ? 'Memeriksa Endpoint...' : 'Cek Kesehatan Webhook (GET /api/midtrans/webhook)'}
              </button>

              {pingResult && (
                <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] space-y-1 overflow-x-auto">
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>HTTP {pingResult.status} {pingResult.ok ? 'OK' : 'ERROR'}</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                  <pre className="text-slate-300">{JSON.stringify(pingResult.data || pingResult.error, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Security checklist */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verifikasi Kriptografi SHA-512 Signature Key</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Auto-sinkronisasi status Invoices &amp; Log Payments</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Server Key diamankan secara server-side</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Testing & Simulator Suite */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Uji Coba Kirim Webhook Midtrans (Simulator)</h3>
            <p className="text-xs text-slate-400">
              Kirim payload notifikasi Midtrans simulasi langsung ke endpoint webhook untuk memverifikasi alur otomatis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Invoice Target</label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 cursor-pointer"
            >
              {unpaidInvoices.length > 0 && (
                <optgroup label="Tagihan Belum Lunas">
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.studentName} ({getMonthName(inv.month)} {inv.year}) - {formatRupiah(inv.amount)}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Semua Tagihan">
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.studentName} [{inv.status}]
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status Transaksi Midtrans</label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 cursor-pointer"
            >
              <option value="settlement">settlement (Lunas / Berhasil)</option>
              <option value="pending">pending (Menunggu Pembayaran)</option>
              <option value="expire">expire (Kadaluarsa)</option>
              <option value="cancel">cancel (Dibatalkan)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Metode / Channel Pembayaran</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 cursor-pointer"
            >
              <option value="qris">QRIS (GoPay, ShopeePay, Dana, BCA)</option>
              <option value="bank_transfer">BCA Virtual Account</option>
              <option value="echannel">Mandiri Bill Payment</option>
              <option value="gopay">GoPay E-Wallet</option>
              <option value="cstore">Indomaret / Alfamart</option>
              <option value="credit_card">Kartu Kredit / Debit</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <p className="text-[11px] text-slate-500">
            Menjalankan pengujian ini akan memicu <code>/api/midtrans/webhook</code> dengan signature SHA-512 terverifikasi.
          </p>
          <button
            type="button"
            onClick={handleSimulateWebhook}
            disabled={isSimulating || !selectedInvoiceId}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSimulating ? 'Memproses Webhook...' : 'Kirim Simulasi Notifikasi Webhook'}
          </button>
        </div>

        {simulationLog && (
          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2">
            <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Respon Webhook Midtrans: HTTP {simulationLog.httpStatus} {simulationLog.success ? 'OK' : 'FAIL'}
              </span>
              <span className="text-slate-400 font-normal">{simulationLog.timestamp}</span>
            </div>
            <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(simulationLog.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Database Reset / Maintenance */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Pemeliharaan &amp; Data Dummy</h3>
        <p className="text-xs text-slate-500 mb-4">
          Gunakan tombol di bawah untuk mengisi ulang database Firestore dengan data contoh santri,
          tagihan SPP, dan riwayat transaksi Midtrans awal.
        </p>

        <button
          type="button"
          onClick={() => {
            if (confirm('Reset ulang data database ke data dummy awal?')) {
              onResetData();
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Reset / Seed Ulang Data Dummy
        </button>
      </div>
    </div>
  );
}
