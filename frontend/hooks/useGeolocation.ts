"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback(() => {
    // Guard: browser tidak support
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Browser Anda tidak mendukung geolocation",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        // Map GeolocationPositionError code ke pesan yang user-friendly
        const messages: Record<number, string> = {
          1: "Akses lokasi ditolak. Izinkan akses lokasi di pengaturan browser.",
          2: "Lokasi tidak dapat ditentukan. Periksa koneksi internet Anda.",
          3: "Permintaan lokasi timeout. Silakan coba lagi.",
        };
        setState({
          latitude: null,
          longitude: null,
          error: messages[err.code] ?? "Gagal mendapatkan lokasi.",
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);

  return { ...state, requestLocation };
};
