// Domain id → label maps. Single source of truth — do not re-declare inline.
// Encoding mirrors the DB model: type 1=Rent/2=Sale, houseType 1=Apartment/2=House.

export const ListingTypes = [
  { id: 1, name: "Rent" },
  { id: 2, name: "Sale" },
];

export const PropertyTypes = [
  { id: 1, name: "Apartment" },
  { id: 2, name: "House" },
];

export const Countries = [
  { id: 1, code: "PH", name: "Philippines" },
  { id: 2, code: "ID", name: "Indonesia" },
];

export const FurnishedTypes = [
  { id: 1, name: "Unfurnished" },
  { id: 2, name: "Semi-furnished" },
  { id: 3, name: "Furnished" },
];

export const Amenities = [
  { key: "air_conditioning", name: "Air conditioning" },
  { key: "balcony", name: "Balcony" },
  { key: "pool", name: "Swimming pool" },
  { key: "gym", name: "Gym" },
  { key: "pet_friendly", name: "Pet-friendly" },
  { key: "security", name: "24/7 security" },
  { key: "wifi", name: "Wi-Fi" },
  { key: "elevator", name: "Elevator" },
];
