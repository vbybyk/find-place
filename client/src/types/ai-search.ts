import { IListing } from "@/types/listings";

export interface IAiSearchCriteria {
  type: number | null;
  house_type: number | null;
  location_text: string | null;
  radius_km: number | null;
  min_price: number | null;
  max_price: number | null;
  min_rooms: number | null;
  min_bathrooms: number | null;
  min_parking: number | null;
  furnished: number | null;
  amenities: string[] | null;
}

export interface IAiSearchResult {
  reply: string;
  criteria: IAiSearchCriteria;
  listings: IListing[];
}
