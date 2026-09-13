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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/midtrans/webhook
 * Health check & configuration endpoint for Midtrans Payment Notification URL.
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
    // 1. Safe parsing of incoming request body
    let payload: any;
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        payload = await req.json();
      } else {
        const rawText = await req.text();
        try {
          payload = JSON.parse(rawText);
        } catch {
          const params = new URLSearchParams(rawText);
          payload = Object.fromEntries(params.entries());
        }
      }
    } catch (parseError) {
      console.error('[Midtrans Webhook] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid or unparseable request body' },
        { status: 400 }
      );
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object' },
        { status: 400 }
      );
    }

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

    console.log('[Midtrans Webhook] Notification received:', {
      order_id,
      status_code,
      gross_amount,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    });

    if (!order_id) {
      return NextResponse.json(
        { error: 'order_id is required in notification payload' },
        { status: 400 }
      );
    }

    // 2. Cryptographic SHA-512 signature validation using MIDTRANS_SERVER_KEY
    const isSignatureValid = verifyMidtransSignature({
      order_id,
      status_code: status_code || '200',
      gross_amount: gross_amount || '0',
      signature_key: signature_key || '',
    });

    if (!isSignatureValid) {
      console.warn('[Midtrans Webhook] Signature verification failed for order:', order_id);
      return NextResponse.json(
        { error: 'Invalid signature key' },
        { status: 403 }
      );
    }

    // 3. Search Invoice based on order_id using prioritized lookup strategies
    let invoiceDocId: string | null = null;
    let invoiceRef: any = null;
    let invoiceData: any = null;

    // Strategy A: Direct query on invoices collection where orderId == order_id
    try {
      const invByOrderQ = query(collection(db, 'invoices'), where('orderId', '==', order_id));
      const invByOrderSnap = await getDocs(invByOrderQ);
      if (!invByOrderSnap.empty) {
        const docSnap = invByOrderSnap.docs[0];
        invoiceDocId = docSnap.id;
        invoiceRef = docSnap.ref;
        invoiceData = docSnap.data();
      }
    } catch (err) {
      console.warn('[Midtrans Webhook] Strategy A (invoice by orderId) error:', err);
    }

    // Strategy B: Check payments collection where orderId == order_id
    let existingPaymentDocId: string | null = null;
    let existingPaymentData: any = null;

    try {
      const paymentsQ = query(collection(db, 'payments'), where('orderId', '==', order_id));
      const paymentsSnap = await getDocs(paymentsQ);
      if (!paymentsSnap.empty) {
        const pDoc = paymentsSnap.docs[0];
        existingPaymentDocId = pDoc.id;
        existingPaymentData = pDoc.data();
        if (!invoiceDocId && existingPaymentData?.invoiceId) {
          invoiceDocId = existingPaymentData.invoiceId;
        }
      }
    } catch (err) {
      console.warn('[Midtrans Webhook] Strategy B (payment by orderId) error:', err);
    }

    // Strategy C: Check by custom_field1 (which carries invoiceId during Snap creation)
    if (!invoiceDocId && custom_field1) {
      invoiceDocId = String(custom_field1).trim();
    }

    // Strategy D: Check if order_id directly equals an invoice document ID
    if (!invoiceDocId) {
      try {
        const directDocRef = doc(db, 'invoices', order_id);
        const directSnap = await getDoc(directDocRef);
        if (directSnap.exists()) {
          invoiceDocId = directSnap.id;
          invoiceRef = directDocRef;
          invoiceData = directSnap.data();
        }
      } catch (err) {
        console.warn('[Midtrans Webhook] Strategy D (direct invoice doc) error:', err);
      }
    }

    // Strategy E: Look for invoice matching alphanumeric invoiceNumber inside order_id
    if (!invoiceDocId) {
      try {
        const allInvoicesSnap = await getDocs(collection(db, 'invoices'));
        for (const docItem of allInvoicesSnap.docs) {
          const inv = docItem.data();
          const cleanInvNum = (inv.invoiceNumber || '').replace(/[^a-zA-Z0-9]/g, '');
          if (cleanInvNum && order_id.includes(cleanInvNum)) {
            invoiceDocId = docItem.id;
            invoiceRef = docItem.ref;
            invoiceData = inv;
            break;
          }
        }
      } catch (err) {
        console.warn('[Midtrans Webhook] Strategy E (invoiceNumber scan) error:', err);
      }
    }

    // If invoiceDocId was identified but document data is not yet fetched, fetch it
    if (invoiceDocId && !invoiceData) {
      try {
        invoiceRef = doc(db, 'invoices', invoiceDocId);
        const fetchedSnap = await getDoc(invoiceRef);
        if (fetchedSnap.exists()) {
          invoiceData = fetchedSnap.data();
        }
      } catch (err) {
        console.warn('[Midtrans Webhook] Failed to fetch invoice doc data:', err);
      }
    }

    // 4. Map Midtrans transaction_status & fraud_status to application states
    let targetInvoiceStatus: 'PAID' | 'PENDING' | 'CANCELLED' | 'EXPIRED' = 'PENDING';
    let targetPaymentStatus: string = transaction_status || 'pending';

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        targetInvoiceStatus = 'PENDING';
        targetPaymentStatus = 'challenge';
      } else if (fraud_status === 'accept') {
        targetInvoiceStatus = 'PAID';
        targetPaymentStatus = 'settlement';
      } else {
        targetInvoiceStatus = 'PENDING';
        targetPaymentStatus = 'capture';
      }
    } else if (transaction_status === 'settlement') {
      targetInvoiceStatus = 'PAID';
      targetPaymentStatus = 'settlement';
    } else if (transaction_status === 'pending') {
      targetInvoiceStatus = 'PENDING';
      targetPaymentStatus = 'pending';
    } else if (transaction_status === 'expire') {
      targetInvoiceStatus = 'EXPIRED';
      targetPaymentStatus = 'expire';
    } else if (transaction_status === 'cancel') {
      targetInvoiceStatus = 'CANCELLED';
      targetPaymentStatus = 'cancel';
    } else if (transaction_status === 'deny') {
      targetInvoiceStatus = 'CANCELLED';
      targetPaymentStatus = 'deny';
    } else if (transaction_status === 'refund' || transaction_status === 'partial_refund') {
      targetInvoiceStatus = 'CANCELLED';
      targetPaymentStatus = 'refund';
    }

    // IDEMPOTENCY GUARD: Once an invoice is PAID, never revert it to EXPIRED, CANCELLED, or PENDING
    if (invoiceData?.status === 'PAID' && targetInvoiceStatus !== 'PAID') {
      console.log(`[Midtrans Webhook] Invoice ${invoiceDocId} is already PAID. Preserving terminal PAID status.`);
      targetInvoiceStatus = 'PAID';
    }

    const nowIso = new Date().toISOString();
    const formattedChannel = formatPaymentChannelName(payment_type, payload);

    // 5. Update or create Payment record in Firestore (Prevent Duplicate Payments)
    let paymentRecordId = existingPaymentDocId;

    if (existingPaymentDocId) {
      // Existing payment attempt found: Update status without duplicating
      try {
        const paymentDocRef = doc(db, 'payments', existingPaymentDocId);
        await updateDoc(paymentDocRef, {
          transactionStatus: targetPaymentStatus,
          paymentType: formattedChannel,
          transactionId: transaction_id || existingPaymentData?.transactionId || '',
          fraudStatus: fraud_status || 'accept',
          settlementTime: targetInvoiceStatus === 'PAID'
            ? (settlement_time || existingPaymentData?.settlementTime || nowIso)
            : null,
          updatedAt: nowIso,
        });
        console.log(`[Midtrans Webhook] Updated existing payment record ${existingPaymentDocId} to ${targetPaymentStatus}`);
      } catch (err) {
        console.error('[Midtrans Webhook] Error updating existing payment record:', err);
      }
    } else {
      // No payment attempt found for this orderId: Create a single new record
      try {
        const newPaymentData = {
          invoiceId: invoiceDocId || '',
          invoiceNumber: invoiceData?.invoiceNumber || order_id,
          studentId: invoiceData?.studentId || '',
          parentId: invoiceData?.parentId || '',
          amount: Number(gross_amount) || invoiceData?.amount || 0,
          orderId: order_id,
          paymentType: formattedChannel,
          transactionStatus: targetPaymentStatus,
          transactionId: transaction_id || `TRX-${Date.now()}`,
          fraudStatus: fraud_status || 'accept',
          settlementTime: targetInvoiceStatus === 'PAID' ? (settlement_time || nowIso) : null,
          createdAt: transaction_time || nowIso,
          updatedAt: nowIso,
        };

        const addedPayment = await addDoc(collection(db, 'payments'), newPaymentData);
        paymentRecordId = addedPayment.id;
        console.log(`[Midtrans Webhook] Created new payment record ${paymentRecordId} for order ${order_id}`);
      } catch (err) {
        console.error('[Midtrans Webhook] Error creating payment record:', err);
      }
    }

    // 6. Update Invoice record in Firestore (if invoice was found)
    if (invoiceRef && invoiceData) {
      try {
        const invoiceUpdatePayload: Record<string, any> = {
          status: targetInvoiceStatus,
          orderId: order_id,
          updatedAt: nowIso,
        };

        if (paymentRecordId) {
          invoiceUpdatePayload.activePaymentId = paymentRecordId;
        }

        if (targetInvoiceStatus === 'PAID') {
          // Preserve previous paidAt if already set, else use settlement_time or now
          invoiceUpdatePayload.paidAt = invoiceData.paidAt || settlement_time || nowIso;
          invoiceUpdatePayload.paymentMethod = formattedChannel.toUpperCase();
        }

        await updateDoc(invoiceRef, invoiceUpdatePayload);
        console.log(`[Midtrans Webhook] Successfully updated invoice ${invoiceDocId} status to ${targetInvoiceStatus}`);
      } catch (err) {
        console.error('[Midtrans Webhook] Error updating invoice document:', err);
      }
    } else {
      console.warn(`[Midtrans Webhook] No matching invoice found in Firestore for order_id: ${order_id}. Acknowledging webhook gracefully.`);
    }

    // 7. Return HTTP 200 OK so Midtrans acknowledges delivery and stops retry queue
    return NextResponse.json({
      status: 'OK',
      message: invoiceData
        ? `Notification successfully processed for order ${order_id}`
        : `Notification received for order ${order_id} (no matching invoice record found)`,
      order_id,
      transaction_status: targetPaymentStatus,
      invoice_status: targetInvoiceStatus,
      invoice_id: invoiceDocId,
      processed_at: nowIso,
    });
  } catch (error: any) {
    console.error('[Midtrans Webhook] Fatal error in webhook handler:', error);
    return NextResponse.json(
      { error: error?.message || 'Webhook internal processing error' },
      { status: 500 }
    );
  }
}

