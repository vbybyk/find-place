"use client";

import { useCallback, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { IPlaceSuggestion, IResolvedPlace } from "@/types/places";

interface IUsePlaceAutocompleteOptions {
  // Restrict predictions, e.g. ["locality", "administrative_area_level_2"] for
  // a city-only search. Omit for full address search.
  includedPrimaryTypes?: string[];
  // ISO-2 region codes to bias/limit results. Defaults to the Philippines.
  includedRegionCodes?: string[];
}

type AddressComponent = google.maps.places.AddressComponent;

// First non-empty component matching any of `types` (in priority order).
const pickComponent = (components: AddressComponent[] | undefined, ...types: string[]) => {
  if (!components) return null;
  for (const type of types) {
    const match = components.find((c) => c.types.includes(type));
    if (match) return match.longText ?? match.shortText ?? null;
  }
  return null;
};

const pickShort = (components: AddressComponent[] | undefined, type: string) =>
  components?.find((c) => c.types.includes(type))?.shortText ?? null;

/**
 * Thin wrapper over the (new) Places API: autocomplete predictions +
 * on-demand Place Details, mapped to our flat address shape. Must be rendered
 * under <GoogleMapsProvider> (it depends on `useMapsLibrary`).
 */
export const usePlaceAutocomplete = (opts: IUsePlaceAutocompleteOptions = {}) => {
  const placesLib = useMapsLibrary("places");
  const [suggestions, setSuggestions] = useState<IPlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // One billing session spans the keystrokes + the details fetch of a single
  // selection, then resets.
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  // Keep the raw predictions so we can `toPlace()` the selected one.
  const predictionsRef = useRef<Map<string, google.maps.places.PlacePrediction>>(new Map());

  const ensureToken = useCallback(() => {
    if (!placesLib) return undefined;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }
    return sessionTokenRef.current;
  }, [placesLib]);

  const search = useCallback(
    async (input: string) => {
      if (!placesLib || !input.trim()) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const { suggestions: results } =
          await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            sessionToken: ensureToken(),
            includedRegionCodes: opts.includedRegionCodes ?? ["ph"],
            includedPrimaryTypes: opts.includedPrimaryTypes,
          });

        const predictions = new Map<string, google.maps.places.PlacePrediction>();
        const mapped: IPlaceSuggestion[] = [];
        for (const s of results) {
          const p = s.placePrediction;
          if (!p) continue;
          predictions.set(p.placeId, p);
          mapped.push({
            id: p.placeId,
            label: p.mainText?.text ?? p.text.text,
            adminName1: p.secondaryText?.text,
          });
        }
        predictionsRef.current = predictions;
        setSuggestions(mapped);
      } catch (error) {
        console.error("Places autocomplete failed", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [placesLib, ensureToken, opts.includedRegionCodes, opts.includedPrimaryTypes]
  );

  const resolve = useCallback(
    async (placeId: string): Promise<IResolvedPlace | null> => {
      if (!placesLib) return null;
      const prediction = predictionsRef.current.get(placeId);
      const place = prediction ? prediction.toPlace() : new placesLib.Place({ id: placeId });

      try {
        await place.fetchFields({
          fields: ["addressComponents", "location", "formattedAddress"],
        });
      } catch (error) {
        console.error("Place details failed", error);
        return null;
      }
      // Selecting a place ends the billing session.
      sessionTokenRef.current = null;

      const components = place.addressComponents ?? undefined;
      return {
        placeId,
        country: pickShort(components, "country"),
        city: pickComponent(components, "locality", "administrative_area_level_2", "postal_town"),
        admin1: pickComponent(components, "administrative_area_level_1"),
        barangay: pickComponent(
          components,
          "sublocality_level_1",
          "sublocality",
          "administrative_area_level_3",
          "neighborhood"
        ),
        postalCode: pickComponent(components, "postal_code"),
        addressLine1:
          [pickComponent(components, "street_number"), pickComponent(components, "route")]
            .filter(Boolean)
            .join(" ") || null,
        latitude: place.location?.lat() ?? null,
        longitude: place.location?.lng() ?? null,
        formattedAddress: place.formattedAddress ?? null,
      };
    },
    [placesLib]
  );

  const clear = useCallback(() => setSuggestions([]), []);

  return { suggestions, loading, ready: !!placesLib, search, resolve, clear };
};
