"use client";

import { useEffect, useRef, useCallback } from "react";

// Extend Window interface untuk snap.js
declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: SnapResult) => void;
          onPending?: (result: SnapResult) => void;
          onError?: (result: SnapResult) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

export interface SnapResult {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount?: string;
  status_code?: string;
}

export interface SnapCallbacks {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

export function useSnap() {
  const snapLoaded = useRef(false);

  useEffect(() => {
    // Cek apakah script sudah ada di DOM (prevent duplicate)
    const existingScript = document.querySelector(
      'script[src*="midtrans.com/snap/snap.js"]',
    );
    if (existingScript || snapLoaded.current) return;

    const snapUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ??
      "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";

    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => {
      snapLoaded.current = true;
    };
    script.onerror = () => {
      console.error("Failed to load Midtrans snap.js");
    };

    document.head.appendChild(script);
  }, []);

  const openSnap = useCallback((snapToken: string, callbacks: SnapCallbacks) => {
    if (typeof window === "undefined" || !window.snap) {
      console.error("Snap.js belum tersedia. Pastikan script sudah diload.");
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        // PENTING: ini hanya untuk UX redirect
        // Status final tetap dari webhook Midtrans → backend → DB
        callbacks.onSuccess?.(result);
      },
      onPending: (result) => {
        callbacks.onPending?.(result);
      },
      onError: (result) => {
        callbacks.onError?.(result);
      },
      onClose: () => {
        // User tutup popup tanpa selesai bayar
        callbacks.onClose?.();
      },
    });
  }, []);

  return { openSnap };
}