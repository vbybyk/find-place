export interface IPlaceSuggestion {
  id: string;
  label: string;
  adminName1?: string;
}

export interface IResolvedPlace {
  placeId: string;
  country: string | null; // ISO-2, e.g. "PH"
  city: string | null; // locality
  admin1: string | null; // administrative_area_level_1 (province)
  barangay: string | null; // sub-locality / district
  postalCode: string | null;
  addressLine1: string | null; // street number + route
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string | null;
}
