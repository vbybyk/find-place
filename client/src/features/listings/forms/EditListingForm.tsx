"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Spinner from "@/components/ui/spinner";
import CategorySection from "./sections/CategorySection";
import BasicsSection from "./sections/BasicsSection";
import DetailsSection from "./sections/DetailsSection";
import PriceSection from "./sections/PriceSection";
import PhotosSection from "./sections/PhotosSection";
import LocationSection from "./sections/LocationSection";
import { updateListing } from "@/lib/actions/listings";
import { IListing, IListingFormValues } from "@/types/listings";
import { formValuesToPayload, listingToFormValues, resolveListingImageUrls } from "@/utils/listings";

const TABS = ["details", "location", "photos"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  details: "Details",
  location: "Location",
  photos: "Photos",
};

const SectionHeading = ({ children }: { children: string }) => (
  <h3 className="text-base font-semibold text-gray-900">{children}</h3>
);

const EditListingForm = ({ listing }: { listing: IListing }) => {
  const [tab, setTab] = useState<Tab>("details");
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, setValue, watch, reset } = useForm<IListingFormValues>({
    mode: "all",
    defaultValues: listingToFormValues(listing),
  });

  const images = watch("images");

  const selectTab = (next: Tab) => {
    if (next === tab) return;
    reset();
    setTab(next);
  };

  const onSubmit = async (data: IListingFormValues) => {
    try {
      setIsSaving(true);
      const imageUrls = await resolveListingImageUrls(data.images ?? []);
      await updateListing(listing.id, formValuesToPayload(data, imageUrls), `/listings/${listing.id}`);
      reset(data);
    } catch (error) {
      console.error("Error while updating listing", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl">
      <div role="tablist" aria-label="Listing sections" className="mb-8 flex gap-6 border-b border-gray-200">
        {TABS.map((value) => {
          const selected = tab === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              id={`tab-${value}`}
              aria-selected={selected}
              aria-controls={`panel-${value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(value)}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium ${
                selected
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {TAB_LABELS[value]}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="panel-details"
        aria-labelledby="tab-details"
        hidden={tab !== "details"}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <SectionHeading>Type</SectionHeading>
            <CategorySection control={control} />
          </div>
          <div className="flex flex-col gap-4">
            <SectionHeading>About</SectionHeading>
            <DetailsSection control={control} />
          </div>
          <div className="flex flex-col gap-4">
            <SectionHeading>Property</SectionHeading>
            <BasicsSection control={control} />
          </div>
          <div className="flex flex-col gap-4">
            <SectionHeading>Pricing</SectionHeading>
            <PriceSection control={control} />
          </div>
        </div>
      </div>

      <div
        role="tabpanel"
        id="panel-location"
        aria-labelledby="tab-location"
        hidden={tab !== "location"}
      >
        <LocationSection
          control={control}
          setValue={setValue}
          watch={watch}
          initialAddress={listing.address_line1 ?? ""}
        />
      </div>

      <div
        role="tabpanel"
        id="panel-photos"
        aria-labelledby="tab-photos"
        hidden={tab !== "photos"}
      >
        <PhotosSection images={images} onChange={(files) => setValue("images", files)} />
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <button type="submit" disabled={isSaving} className="ui-button">
          Save
          {isSaving && <Spinner className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
};

export default EditListingForm;
