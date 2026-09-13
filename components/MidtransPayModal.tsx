'use client';

import React, { useState, useEffect } from 'react';
import { Invoice } from '@/types';
import { formatRupiah, getMonthName } from '@/lib/format';
import { loadSnapScript } from '@/lib/midtrans-client';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface MidtransPayModalProps {
  invoice: Invoice | null;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  onClose: () => void;
  onPaymentSuccess: (invoiceId: string) => void;
  onViewReceipt: (invoice: Invoice) => void;
}

export function MidtransPayModal({
  invoice,
  parentName,
  parentEmail,
  parentPhone,
  onClose,
  onPaymentSuccess,
  onViewReceipt,
}: MidtransPayModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'review' | 'snap' | 'success' | 'failed'>('review');
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'bca_va' | 'mandiri_va' | 'gopay'>('qris');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  useEffect(() => {
    // Attempt loading Midtrans Snap client script in background
    loadSnapScript(process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, false);
  }, []);

  if (!invoice) return null;

  // Step 1: Request Snap Token from Backend API
  const handleInitiatePayment = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          parentName,
          parentEmail,
          parentPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memulai transaksi pembayaran');
      }

      setSnapToken(data.snapToken);
      setOrderId(data.orderId);
      setIsSimulated(data.isSimulated || false);

      // If real Midtrans Snap is active in window and not simulated, launch official Snap popup
      if (!data.isSimulated && window.snap && data.snapToken) {
        window.snap.pay(data.snapToken, {
          onSuccess: async (result: any) => {
            console.log('Snap success:', result);
            handlePaymentCompleted();
          },
          onPending: (result: any) => {
            console.log('Snap pending:', result);
            setPaymentStep('snap');
          },
          onError: (result: any) => {
            console.error('Snap error:', result);
            setErrorMessage('Pembayaran gagal atau dibatalkan oleh user.');
            setPaymentStep('failed');
          },
          onClose: () => {
            console.log('Snap popup closed');
          },
        });
      } else {
        // Use rich interactive sandbox simulator interface
        setPaymentStep('snap');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem');
      setPaymentStep('failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Trigger Webhook / Verification on Server
  const handleCompleteSandboxPayment = async (status: 'settlement' | 'cancel' | 'expire') => {
    if (!orderId) return;
    setIsProcessingPayment(true);

    try {
      const res = await fetch('/api/midtrans/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          targetStatus: status,
          paymentType: selectedMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memverifikasi pembayaran');
      }

      if (status === 'settlement') {
        handlePaymentCompleted();
      } else {
        setErrorMessage(`Status transaksi disimulasikan: ${status}`);
        setPaymentStep('failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyelesaikan simulasi');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentCompleted = () => {
    setPaymentStep('success');
    // Celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
    onPaymentSuccess(invoice.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Pembayaran SPP Online</h3>
              <p className="text-xs text-slate-400">Midtrans Snap Payment Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Review Detail Tagihan */}
        {paymentStep === 'review' && (
          <div className="p-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Nomor Tagihan</span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Nama Santri / Siswa</span>
                  <span className="font-semibold text-slate-800">{invoice.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kelas</span>
                  <span className="font-semibold text-slate-800">{invoice.className}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bulan Tagihan</span>
                  <span className="font-semibold text-slate-800">
                    {getMonthName(invoice.month)} {invoice.year}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jatuh Tempo</span>
                  <span className="font-semibold text-slate-800">{invoice.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline justify-between p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl mb-6">
              <span className="text-xs font-semibold text-emerald-900">Total Pembayaran</span>
              <span className="text-xl font-extrabold text-emerald-700">
                {formatRupiah(invoice.amount)}
              </span>
            </div>

            <div className="text-xs text-slate-500 mb-6 flex items-start gap-2 bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200/60">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Pembayaran diverifikasi secara otomatis melalui Webhook Midtrans. Bukti pembayaran
                resmi akan langsung tersedia setelah transaksi dinyatakan berhasil.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={loading}
                className="w-1/2 py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Bayar Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Midtrans Snap Sandbox Simulator */}
        {paymentStep === 'snap' && (
          <div className="p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-800">
                  Midtrans Sandbox
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {orderId}
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-700">
                {formatRupiah(invoice.amount)}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3 font-medium">
              Pilih metode pembayaran (Simulasi Sandbox):
            </p>

            <div className="space-y-2 mb-6">
              {/* QRIS */}
              <label
                onClick={() => setSelectedMethod('qris')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  selectedMethod === 'qris'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700">
                    <QrCode className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">QRIS (Gopay / OVO / Dana / BCA)</div>
                    <div className="text-[11px] text-slate-400">Scan QR Code instan</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === 'qris'}
                  onChange={() => setSelectedMethod('qris')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              {/* BCA Virtual Account */}
              <label
                onClick={() => setSelectedMethod('bca_va')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  selectedMethod === 'bca_va'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">BCA Virtual Account</div>
                    <div className="text-[11px] text-slate-400">Nomor VA: 7890 0812 3456 7890</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === 'bca_va'}
                  onChange={() => setSelectedMethod('bca_va')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              {/* Mandiri Virtual Account */}
              <label
                onClick={() => setSelectedMethod('mandiri_va')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  selectedMethod === 'mandiri_va'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700">
                    <Building2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Mandiri Bill Payment</div>
                    <div className="text-[11px] text-slate-400">Biller Code: 70012</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === 'mandiri_va'}
                  onChange={() => setSelectedMethod('mandiri_va')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              {/* GoPay / E-Wallet */}
              <label
                onClick={() => setSelectedMethod('gopay')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  selectedMethod === 'gopay'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700">
                    <Wallet className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">GoPay / ShopeePay</div>
                    <div className="text-[11px] text-slate-400">Autodebet dompet digital</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === 'gopay'}
                  onChange={() => setSelectedMethod('gopay')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            {/* Action Simulator */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleCompleteSandboxPayment('settlement')}
                disabled={isProcessingPayment}
                className="w-full py-3 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghubungi Webhook Backend...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Simulasikan Pembayaran Berhasil (Settlement)
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCompleteSandboxPayment('expire')}
                  disabled={isProcessingPayment}
                  className="py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Simulasi Kadaluarsa (Expire)
                </button>
                <button
                  type="button"
                  onClick={() => handleCompleteSandboxPayment('cancel')}
                  disabled={isProcessingPayment}
                  className="py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                >
                  Simulasi Batal (Cancel)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {paymentStep === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-1">
              Pembayaran SPP Berhasil!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Midtrans telah memverifikasi pembayaran Anda. Status tagihan telah diperbarui menjadi{' '}
              <span className="font-bold text-emerald-700">PAID (Lunas)</span> di sistem database.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs mb-6 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Santri:</span>
                <span className="font-semibold text-slate-800">{invoice.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode:</span>
                <span className="font-semibold text-slate-800">
                  {getMonthName(invoice.month)} {invoice.year}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal:</span>
                <span className="font-bold text-emerald-700">{formatRupiah(invoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode:</span>
                <span className="font-semibold uppercase text-slate-800">{selectedMethod}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewReceipt({
                    ...invoice,
                    status: 'PAID',
                    paymentMethod: selectedMethod.toUpperCase(),
                    paidAt: new Date().toISOString(),
                  });
                }}
                className="w-1/2 py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Lihat Kwitansi
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Failed / Error */}
        {paymentStep === 'failed' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-1">
              Pembayaran Tidak Berhasil
            </h4>
            <p className="text-xs text-rose-600 mb-6">
              {errorMessage || 'Transaksi dibatalkan atau waktu pembayaran telah habis.'}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => setPaymentStep('review')}
                className="w-1/2 py-2.5 px-4 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs transition cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
