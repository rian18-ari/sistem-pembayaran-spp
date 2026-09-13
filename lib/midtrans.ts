import crypto from 'crypto';

export interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export function getMidtransConfig(): MidtransConfig {
  const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim().replace(/^["']|["']$/g, '');
  const clientKey = (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '').trim().replace(/^["']|["']$/g, '');
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  return {
    serverKey,
    clientKey,
    isProduction,
  };
}

export const MIDTRANS_SNAP_BASE_URL = {
  sandbox: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
  production: 'https://app.midtrans.com/snap/v1/transactions',
};

export const MIDTRANS_SNAP_JS = {
  sandbox: 'https://app.sandbox.midtrans.com/snap/snap.js',
  production: 'https://app.midtrans.com/snap/snap.js',
};

/**
 * Creates a transaction token with Midtrans Snap API.
 */
export async function createMidtransSnapTransaction(params: {
  orderId: string;
  grossAmount: number;
  invoiceId?: string;
  itemDetails: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
  customerDetails: {
    first_name: string;
    email?: string;
    phone?: string;
  };
}): Promise<{ token: string; redirect_url: string; isSimulated?: boolean }> {
  const config = getMidtransConfig();

  if (!config.serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY belum diatur di environment variable server.');
  }

  const endpoint = config.isProduction ? MIDTRANS_SNAP_BASE_URL.production : MIDTRANS_SNAP_BASE_URL.sandbox;
  const authHeader = `Basic ${Buffer.from(`${config.serverKey}:`).toString('base64')}`;

  const requestBody = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    item_details: params.itemDetails,
    customer_details: params.customerDetails,
    custom_field1: params.invoiceId || '',
    callbacks: {
      finish: `${process.env.APP_URL || ''}/payment/success?order_id=${params.orderId}`,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = Array.isArray(errorData?.error_messages)
      ? errorData.error_messages.join(', ')
      : errorData?.message || `Midtrans Snap API returned HTTP ${response.status}`;
    console.error('[Midtrans Snap] API Error:', errorMsg, errorData);
    throw new Error(`Midtrans API: ${errorMsg}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    redirect_url: data.redirect_url,
    isSimulated: false,
  };
}

/**
 * Generates Midtrans SHA512 signature key for testing or validation.
 */
export function generateMidtransSignature(params: {
  order_id: string;
  status_code: string;
  gross_amount: string | number;
  server_key?: string;
}): string {
  const serverKey = (params.server_key || getMidtransConfig().serverKey || '').trim();
  const grossAmountStr = String(params.gross_amount).trim();
  const rawString = `${params.order_id}${params.status_code}${grossAmountStr}${serverKey}`;
  return crypto.createHash('sha512').update(rawString).digest('hex');
}

/**
 * Validates Midtrans Webhook SHA512 signature.
 */
export function verifyMidtransSignature(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string | number;
  signature_key: string;
}): boolean {
  try {
    const { serverKey } = getMidtransConfig();
    if (!serverKey) {
      console.warn('[Midtrans Webhook] MIDTRANS_SERVER_KEY is not configured in environment');
      return false;
    }

    const trimmedKey = serverKey.trim();
    const cleanSig = (payload.signature_key || '').trim().toLowerCase();
    const orderId = String(payload.order_id || '').trim();
    const statusCode = String(payload.status_code || '').trim();
    const grossAmountStr = String(payload.gross_amount ?? '').trim();

    if (!orderId || !statusCode || !cleanSig) {
      return false;
    }

    // 1. Direct hash with raw gross_amount string as sent by Midtrans
    const hash1 = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmountStr}${trimmedKey}`)
      .digest('hex')
      .toLowerCase();
    if (hash1 === cleanSig) return true;

    // 2. Hash with standard 2 decimal format (e.g. 450000.00)
    const numAmount = Number(grossAmountStr);
    if (!isNaN(numAmount)) {
      const formatted2Dec = numAmount.toFixed(2);
      const hash2 = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${formatted2Dec}${trimmedKey}`)
        .digest('hex')
        .toLowerCase();
      if (hash2 === cleanSig) return true;

      // 3. Hash with integer format without decimals (e.g. 450000)
      const formattedInt = String(Math.round(numAmount));
      const hash3 = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${formattedInt}${trimmedKey}`)
        .digest('hex')
        .toLowerCase();
      if (hash3 === cleanSig) return true;
    }

    return false;
  } catch (err) {
    console.error('[Midtrans Webhook] Signature verification exception:', err);
    return false;
  }
}

/**
 * Formats Midtrans payment channel nicely (e.g. "BCA Virtual Account", "QRIS", "GoPay")
 */
export function formatPaymentChannelName(paymentType?: string, payload?: any): string {
  if (!paymentType) return 'Midtrans Snap';

  const pt = paymentType.toLowerCase();
  if (pt === 'bank_transfer') {
    if (payload?.va_numbers && payload.va_numbers.length > 0) {
      const bank = (payload.va_numbers[0].bank || '').toUpperCase();
      const va = payload.va_numbers[0].va_number || '';
      return `${bank} Virtual Account${va ? ` (${va})` : ''}`;
    }
    if (payload?.permata_va_number) {
      return `Permata Virtual Account (${payload.permata_va_number})`;
    }
    return 'Bank Transfer / Virtual Account';
  }

  if (pt === 'echannel') {
    return 'Mandiri Bill Payment';
  }

  if (pt === 'qris') {
    const issuer = payload?.issuer ? ` (${payload.issuer.toUpperCase()})` : '';
    return `QRIS${issuer}`;
  }

  if (pt === 'gopay') return 'GoPay';
  if (pt === 'shopeepay') return 'ShopeePay';
  if (pt === 'cstore') {
    const store = payload?.store ? ` (${payload.store})` : '';
    return `Gerai Retail${store}`;
  }
  if (pt === 'credit_card') return 'Kartu Kredit / Debit';

  return paymentType.toUpperCase();
}

