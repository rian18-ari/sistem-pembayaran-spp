import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { generateMidtransSignature } from '@/lib/midtrans';

export async function POST(req: NextRequest) {
  try {
    const { orderId, targetStatus = 'settlement', paymentType = 'qris', invoiceId: inputInvoiceId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Find payment document to get gross amount and invoice details
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('orderId', '==', orderId));
    const snap = await getDocs(q);

    let grossAmount = '150000.00';
    let invoiceId = inputInvoiceId || '';

    if (!snap.empty) {
      const p = snap.docs[0].data();
      grossAmount = `${p.amount || 150000}.00`;
      invoiceId = p.invoiceId || invoiceId;
    }

    const statusCode = targetStatus === 'settlement' ? '200' : targetStatus === 'pending' ? '201' : '202';
    const signatureKey = generateMidtransSignature({
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
    });

    // Call the webhook endpoint directly
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const webhookUrl = `${protocol}://${host}/api/midtrans/webhook`;

    const webhookPayload = {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: targetStatus,
      fraud_status: 'accept',
      payment_type: paymentType,
      transaction_id: `SIM-TRX-${Date.now()}`,
      settlement_time: targetStatus === 'settlement' ? new Date().toISOString() : null,
      transaction_time: new Date().toISOString(),
      custom_field1: invoiceId,
    };

    const webhookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    });

    const webhookData = await webhookRes.json();

    return NextResponse.json({
      success: webhookRes.ok,
      webhookStatus: webhookRes.status,
      webhookResult: webhookData,
      payloadSent: webhookPayload,
    });
  } catch (error: any) {
    console.error('Simulation error:', error);
    return NextResponse.json({ error: error?.message || 'Simulation failed' }, { status: 500 });
  }
}
