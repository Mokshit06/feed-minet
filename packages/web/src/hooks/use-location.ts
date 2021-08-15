import { useEffect } from 'react';
import create from 'zustand';

type Coords = {
  latitude: number;
  longitude: number;
};

export const useLocationStore = create<{
  location: Coords | null;
  setLocation: (location: Coords) => void;
}>(set => ({
  location: null,
  setLocation: location => set({ location }),
}));

export default function useLocation() {
  const { setLocation, location } = useLocationStore();

  useEffect(() => {
    if (useLocationStore.getState().location) return;

    if (navigator.geolocation.getCurrentPosition) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        },
        err => {
          console.log(err);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [setLocation]);

  return location;
}
