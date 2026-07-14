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
