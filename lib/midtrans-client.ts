declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export function loadSnapScript(clientKey?: string, isProduction: boolean = false): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.snap) {
      resolve(true);
      return;
    }

    const scriptId = 'midtrans-snap-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.onload = () => resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    if (clientKey) {
      script.setAttribute('data-client-key', clientKey);
    }

    script.onload = () => {
      console.log('Midtrans Snap script loaded successfully');
      resolve(true);
    };

    script.onerror = () => {
      console.warn('Failed to load Midtrans Snap script, fallback simulator will be used.');
      resolve(false);
    };

    document.head.appendChild(script);
  });
}
