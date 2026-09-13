import crypto from 'crypto';

export interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export function getMidtransConfig(): MidtransConfig {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
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
  const isPlaceholderKey = !config.serverKey || config.serverKey.includes('YOUR_SANDBOX_SERVER_KEY');

  // If server key is real/configured, call official Midtrans Snap endpoint
  if (!isPlaceholderKey) {
    const endpoint = config.isProduction ? MIDTRANS_SNAP_BASE_URL.production : MIDTRANS_SNAP_BASE_URL.sandbox;
    const authHeader = `Basic ${Buffer.from(`${config.serverKey}:`).toString('base64')}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Midtrans API responded with error:', errorData);
      } else {
        const data = await response.json();
        return {
          token: data.token,
          redirect_url: data.redirect_url,
          isSimulated: false,
        };
      }
    } catch (err) {
      console.warn('Network error reaching Midtrans Snap API, using simulator mode:', err);
    }
  }

  // Graceful Sandbox Simulator Token for development / test preview
  const simulatedToken = `SANDBOX-SNAP-${crypto.randomBytes(12).toString('hex')}`;
  return {
    token: simulatedToken,
    redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${simulatedToken}`,
    isSimulated: true,
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
  const serverKey = params.server_key || getMidtransConfig().serverKey || 'default_server_key';
  const grossAmountStr = String(params.gross_amount);
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
  const { serverKey } = getMidtransConfig();
  if (!serverKey || serverKey.includes('YOUR_SANDBOX_SERVER_KEY')) {
    // In dev simulator without real key, accept for testing
    return true;
  }

  const grossAmountStr = String(payload.gross_amount);
  const rawString = `${payload.order_id}${payload.status_code}${grossAmountStr}${serverKey}`;
  const computedHash = crypto.createHash('sha512').update(rawString).digest('hex');
  if (computedHash.toLowerCase() === (payload.signature_key || '').toLowerCase()) {
    return true;
  }

  // Also try with .00 if integer format, or without .00 if decimal format
  if (!grossAmountStr.includes('.')) {
    const withDecimals = `${payload.order_id}${payload.status_code}${grossAmountStr}.00${serverKey}`;
    if (
      crypto.createHash('sha512').update(withDecimals).digest('hex').toLowerCase() ===
      (payload.signature_key || '').toLowerCase()
    ) {
      return true;
    }
  } else if (grossAmountStr.endsWith('.00')) {
    const withoutDecimals = `${payload.order_id}${payload.status_code}${grossAmountStr.replace('.00', '')}${serverKey}`;
    if (
      crypto.createHash('sha512').update(withoutDecimals).digest('hex').toLowerCase() ===
      (payload.signature_key || '').toLowerCase()
    ) {
      return true;
    }
  }

  return false;
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

