import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  addDoc,
} from 'firebase/firestore';
import {
  verifyMidtransSignature,
  formatPaymentChannelName,
  getMidtransConfig,
} from '@/lib/midtrans';

/**
 * GET /api/midtrans/webhook
 * Useful for checking webhook health, URL validation, and testing ping from browser or Midtrans Simulator.
 */
export async function GET(req: NextRequest) {
  const config = getMidtransConfig();
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const webhookUrl = `${protocol}://${host}/api/midtrans/webhook`;

  return NextResponse.json({
    status: 'healthy',
    service: 'Midtrans Payment Gateway Webhook Endpoint',
    endpoint: '/api/midtrans/webhook',
    configured_webhook_url: webhookUrl,
    environment: config.isProduction ? 'production' : 'sandbox',
    methods_supported: ['GET', 'POST'],
    instructions: {
      step_1: 'Buka dashboard Midtrans (https://dashboard.midtrans.com/ atau https://dashboard.sandbox.midtrans.com/)',
      step_2: 'Masuk ke menu Settings > Configuration',
      step_3: `Masukkan Payment Notification URL: ${webhookUrl}`,
      step_4: 'Pastikan status code 200 OK diterima dari endpoint ini.',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/midtrans/webhook
 * Receives real-time HTTP notification from Midtrans when payment state changes.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('[Midtrans Webhook] Received notification payload:', {
      order_id: payload.order_id,
      status_code: payload.status_code,
      gross_amount: payload.gross_amount,
      transaction_status: payload.transaction_status,
      fraud_status: payload.fraud_status,
      payment_type: payload.payment_type,
    });

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
      settlement_time,
      transaction_time,
      custom_field1,
    } = payload;

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Verify SHA-512 signature
    const isValid = verifyMidtransSignature({
      order_id,
      status_code: status_code || '200',
      gross_amount: gross_amount || '0',
      signature_key: signature_key || '',
    });

    if (!isValid) {
      console.warn('[Midtrans Webhook] Invalid signature detected for order:', order_id);
      return NextResponse.json({ error: 'Invalid signature key' }, { status: 403 });
    }

    // 1. Find existing payment attempt by orderId
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('orderId', '==', order_id));
    const querySnapshot = await getDocs(q);

    let paymentDocId: string | null = null;
    let invoiceId: string | null = null;
    let paymentData: any = null;

    if (!querySnapshot.empty) {
      const paymentDoc = querySnapshot.docs[0];
      paymentDocId = paymentDoc.id;
      paymentData = paymentDoc.data();
      invoiceId = paymentData.invoiceId;
    } else {
      console.warn(`[Midtrans Webhook] Payment attempt with orderId ${order_id} not in payments collection, searching invoice fallback...`);
    }

    // Fallback: If invoiceId wasn't found in payments, check custom_field1 or parse order_id
    if (!invoiceId) {
      if (custom_field1) {
        invoiceId = custom_field1;
      } else {
        // Try to match invoices by invoiceNumber prefix inside order_id (e.g. SPP-INV202409...-123456)
        const invSnap = await getDocs(collection(db, 'invoices'));
        for (const docSnap of invSnap.docs) {
          const inv = docSnap.data();
          const cleanInvNum = (inv.invoiceNumber || '').replace(/[^a-zA-Z0-9]/g, '');
          if (cleanInvNum && order_id.includes(cleanInvNum)) {
            invoiceId = docSnap.id;
            break;
          }
        }
      }
    }

    // 2. Determine target invoice status based on Midtrans transaction & fraud status
    let invoiceStatus: 'PAID' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'UNPAID' = 'PENDING';
    let paymentTransactionStatus: string = transaction_status || 'pending';

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        invoiceStatus = 'PENDING';
        paymentTransactionStatus = 'challenge';
      } else if (fraud_status === 'accept') {
        invoiceStatus = 'PAID';
        paymentTransactionStatus = 'settlement';
      } else {
        invoiceStatus = 'PENDING';
        paymentTransactionStatus = 'capture';
      }
    } else if (transaction_status === 'settlement') {
      invoiceStatus = 'PAID';
      paymentTransactionStatus = 'settlement';
    } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
      invoiceStatus = 'CANCELLED';
      paymentTransactionStatus = 'cancel';
    } else if (transaction_status === 'expire') {
      invoiceStatus = 'EXPIRED';
      paymentTransactionStatus = 'expire';
    } else if (transaction_status === 'pending') {
      invoiceStatus = 'PENDING';
      paymentTransactionStatus = 'pending';
    } else if (transaction_status === 'refund' || transaction_status === 'partial_refund') {
      invoiceStatus = 'CANCELLED';
      paymentTransactionStatus = 'refund';
    }

    const nowIso = new Date().toISOString();
    const formattedChannel = formatPaymentChannelName(payment_type, payload);

    // 3. Update or Create Payment record in Firestore
    if (paymentDocId) {
      const paymentRef = doc(db, 'payments', paymentDocId);
      await updateDoc(paymentRef, {
        transactionStatus: paymentTransactionStatus,
        paymentType: formattedChannel,
        transactionId: transaction_id || paymentData?.transactionId || '',
        fraudStatus: fraud_status || 'accept',
        settlementTime: invoiceStatus === 'PAID' ? (settlement_time || nowIso) : null,
        updatedAt: nowIso,
      });
      console.log(`[Midtrans Webhook] Updated existing payment ${paymentDocId} to ${paymentTransactionStatus}`);
    } else if (invoiceId) {
      // Create payment attempt record on the fly so history is never lost
      const invoiceRef = doc(db, 'invoices', invoiceId);
      const invoiceSnap = await getDoc(invoiceRef);
      const invData = invoiceSnap.exists() ? invoiceSnap.data() : null;

      const newPaymentRecord = {
        invoiceId,
        invoiceNumber: invData?.invoiceNumber || order_id,
        studentId: invData?.studentId || '',
        parentId: invData?.parentId || '',
        amount: Number(gross_amount) || invData?.amount || 0,
        orderId: order_id,
        paymentType: formattedChannel,
        transactionStatus: paymentTransactionStatus,
        transactionId: transaction_id || `TRX-${Date.now()}`,
        fraudStatus: fraud_status || 'accept',
        settlementTime: invoiceStatus === 'PAID' ? (settlement_time || nowIso) : null,
        createdAt: transaction_time || nowIso,
        updatedAt: nowIso,
      };

      const added = await addDoc(collection(db, 'payments'), newPaymentRecord);
      paymentDocId = added.id;
      console.log(`[Midtrans Webhook] Created new payment record ${paymentDocId} for order ${order_id}`);
    }

    // 4. Update Invoice record
    if (invoiceId) {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      const invoiceSnap = await getDoc(invoiceRef);

      if (invoiceSnap.exists()) {
        const updatePayload: any = {
          status: invoiceStatus,
          updatedAt: nowIso,
        };

        if (invoiceStatus === 'PAID') {
          updatePayload.paidAt = settlement_time || nowIso;
          updatePayload.paymentMethod = formattedChannel.toUpperCase();
          if (paymentDocId) {
            updatePayload.activePaymentId = paymentDocId;
          }
        }

        await updateDoc(invoiceRef, updatePayload);
        console.log(`[Midtrans Webhook] Invoice ${invoiceId} marked as ${invoiceStatus}`);
      }
    }

    // Return 200 OK so Midtrans stops retry queue
    return NextResponse.json({
      status: 'OK',
      message: `Notification processed for order ${order_id}`,
      order_id,
      transaction_status: paymentTransactionStatus,
      invoice_status: invoiceStatus,
      invoice_id: invoiceId,
      processed_at: nowIso,
    });
  } catch (error: any) {
    console.error('[Midtrans Webhook] Processing error:', error);
    return NextResponse.json(
      { error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
