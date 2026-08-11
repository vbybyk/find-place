"use client";

import { ReactNode } from "react";
import { Control, useWatch } from "react-hook-form";
import { ListingTypes, PropertyTypes, FurnishedTypes } from "@/constants/listings";
import { IListingFormValues } from "@/types/listings";

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-6 py-2.5">
    <dt className="text-gray-500">{label}</dt>
    <dd className="text-right font-medium">{value || "—"}</dd>
  </div>
);

const nameById = (list: { id: number; name: string }[], id: unknown) => list.find((o) => o.id === Number(id))?.name;

const ReviewSection = ({ control }: { control: Control<IListingFormValues> }) => {
  const v = useWatch({ control });

  const rows: { label: string; value: ReactNode }[] = [
    { label: "Listing type", value: nameById(ListingTypes, v.type) },
    { label: "Property type", value: nameById(PropertyTypes, v.houseType) },
    { label: "Bed / Bath / Parking", value: `${v.roomsNumber ?? 0} · ${v.bathrooms ?? 0} · ${v.parking ?? 0}` },
    { label: "Floor area", value: v.areaTotal ? `${v.areaTotal} m²` : "" },
    { label: "Furnishing", value: nameById(FurnishedTypes, v.furnished) },
    { label: "Amenities", value: `${v.amenities?.length ?? 0} selected` },
    { label: "Title", value: v.title },
    { label: "Price", value: v.price ? `${v.price}₱${v.discount ? ` (−${v.discount}%)` : ""}` : "" },
    { label: "Photos", value: `${v.images?.length ?? 0} added` },
    {
      label: "Location",
      value: [v.location?.addressLine1, v.location?.city, v.location?.admin1].filter(Boolean).join(", "),
    },
  ];

  return (
    <dl className="divide-y divide-gray-100 text-sm">
      {rows.map((r) => (
        <Row key={r.label} label={r.label} value={r.value} />
      ))}
    </dl>
  );
};

export default ReviewSection;
