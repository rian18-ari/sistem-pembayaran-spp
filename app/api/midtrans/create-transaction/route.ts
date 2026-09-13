import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { createMidtransSnapTransaction } from '@/lib/midtrans';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId, parentName, parentEmail, parentPhone } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'invoiceId is required' },
        { status: 400 }
      );
    }

    // Retrieve the invoice from Firestore
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);

    if (!invoiceSnap.exists()) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoiceData = invoiceSnap.data();

    // Check if already paid
    if (invoiceData.status === 'PAID') {
      return NextResponse.json(
        { error: 'Tagihan ini sudah lunas (PAID)' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const uniqueSuffix = Date.now().toString().slice(-6);
    const orderId = `SPP-${invoiceData.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '')}-${uniqueSuffix}`;

    const monthNames = [
      '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthLabel = monthNames[invoiceData.month] || `Bulan ${invoiceData.month}`;
    const itemName = `SPP ${monthLabel} ${invoiceData.year} - ${invoiceData.studentName}`.slice(0, 50);

    // Call Midtrans Snap backend
    const snapResult = await createMidtransSnapTransaction({
      orderId,
      grossAmount: invoiceData.amount,
      invoiceId,
      itemDetails: [
        {
          id: invoiceData.invoiceNumber,
          price: invoiceData.amount,
          quantity: 1,
          name: itemName,
        },
      ],
      customerDetails: {
        first_name: parentName || invoiceData.parentName || 'Wali Santri',
        email: parentEmail || 'wali@sekolah.sch.id',
        phone: parentPhone || '08123456789',
      },
    });

    // Create a record in `payments` collection
    const paymentRecord = {
      invoiceId,
      invoiceNumber: invoiceData.invoiceNumber,
      studentId: invoiceData.studentId,
      parentId: invoiceData.parentId,
      amount: invoiceData.amount,
      orderId,
      snapToken: snapResult.token,
      snapRedirectUrl: snapResult.redirect_url,
      transactionStatus: 'pending',
      createdAt: new Date().toISOString(),
      isSimulated: !!snapResult.isSimulated,
    };

    const paymentRef = await addDoc(collection(db, 'payments'), paymentRecord);

    // Update invoice to PENDING with this activePaymentId
    await updateDoc(invoiceRef, {
      status: 'PENDING',
      activePaymentId: paymentRef.id,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      snapToken: snapResult.token,
      snapRedirectUrl: snapResult.redirect_url,
      orderId,
      paymentId: paymentRef.id,
      isSimulated: snapResult.isSimulated,
    });
  } catch (error: any) {
    console.error('Error creating Midtrans transaction:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal membuat transaksi Midtrans' },
      { status: 500 }
    );
  }
}
