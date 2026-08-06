"use client";

import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import Autocomplete from "@/components/ui/autocomplete";
import { usePlaceAutocomplete } from "@/hooks/places";
import { IPlaceSuggestion, IResolvedPlace } from "@/types/places";

interface IProps {
  latitude: number | null;
  longitude: number | null;
  initialAddress?: string;
  onResolve: (place: IResolvedPlace) => void;
  onPinChange: (lat: number, lng: number) => void;
}

// Metro Manila — fallback centre before a place is picked.
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 };
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";

// Pans the map whenever the resolved/pinned position changes. Must live inside <Map>.
const Recenter = ({ position }: { position: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (map && position) map.panTo(position);
  }, [map, position]);
  return null;
};

const LocationPicker = ({ latitude, longitude, initialAddress, onResolve, onPinChange }: IProps) => {
  const { suggestions, loading, search, resolve } = usePlaceAutocomplete();
  const [input, setInput] = useState(initialAddress ?? "");
  const [selected, setSelected] = useState<IPlaceSuggestion | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced prediction fetch as the user types.
  useEffect(() => {
    if (!input || selected?.label === input) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(input), 250);
    return () => clearTimeout(debounceRef.current);
  }, [input, selected, search]);

  const onInputChange = (_e: SyntheticEvent, value: string) => {
    setInput(value);
    if (!value) setSelected(null);
  };

  const onSelect = async (option: IPlaceSuggestion | null) => {
    if (!option) {
      setSelected(null);
      return;
    }
    setSelected(option);
    const place = await resolve(option.id);
    if (place) {
      onResolve(place);
      setInput(place.formattedAddress ?? option.label);
    }
  };

  const position =
    latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label htmlFor="address-search">Search address</label>
        <Autocomplete
          options={suggestions}
          inputValue={input}
          onInputChange={onInputChange}
          value={selected}
          onChange={onSelect}
          loading={loading}
          className="w-full"
        />
      </div>
      <div className="h-72 w-full overflow-hidden rounded-lg border border-solid border-gray-200 dark:border-gray-700">
        <Map
          mapId={MAP_ID}
          defaultCenter={position ?? DEFAULT_CENTER}
          defaultZoom={position ? 16 : 11}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          clickableIcons={false}
          controlSize={28}
          className="h-full w-full"
        >
          <AdvancedMarker
            position={position ?? DEFAULT_CENTER}
            draggable
            onDragEnd={(e) => {
              const lat = e.latLng?.lat();
              const lng = e.latLng?.lng();
              if (lat != null && lng != null) onPinChange(lat, lng);
            }}
          >
            <Pin background="#4f46e5" glyphColor="#ffffff" borderColor="#312e81" scale={1.1} />
          </AdvancedMarker>
          <Recenter position={position} />
        </Map>
      </div>
      <p className="text-xs text-gray-400">Drag the pin to set the exact location.</p>
    </div>
  );
};

export default LocationPicker;
