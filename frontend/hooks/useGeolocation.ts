"use client";

import { useState } from "react";

interface Geolocation {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<Geolocation>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const requestLocation = () => {
    setLocation((prev) => ({ ...prev, loading: true }));

    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        error: "Geolocation not supported",
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setLocation({
          latitude: null,
          longitude: null,
          error: error.message,
          loading: false,
        });
      },
    );
  };

  return { ...location, requestLocation };
};
