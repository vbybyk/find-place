"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import CategorySection from "./sections/CategorySection";
import LocationSection from "./sections/LocationSection";
import BasicsSection from "./sections/BasicsSection";
import DetailsSection from "./sections/DetailsSection";
import PhotosSection from "./sections/PhotosSection";
import PriceSection from "./sections/PriceSection";
import { createListing } from "@/lib/actions/listings";
import { ListingTypes, PropertyTypes, FurnishedTypes } from "@/constants/listings";
import { IListingFormValues, IListingPayload } from "@/types/listings";

const STEPS = ["Type", "Location", "Basics", "Details", "Photos", "Price", "Review"] as const;

const StepHeading = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-semibold">{title}</h2>
    {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
  </div>
);

const ReviewRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-6 py-2.5">
    <dt className="text-gray-500">{label}</dt>
    <dd className="text-right font-medium">{value || "—"}</dd>
  </div>
);

const CreateListingWizard = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue, watch, getValues } = useForm<IListingFormValues>({
    mode: "all",
    defaultValues: {
      userId: 0,
      title: "",
      description: "",
      price: 0,
      discount: 0,
      type: 0,
      houseType: 0,
      furnished: 0,
      roomsNumber: 1,
      bathrooms: 1,
      parking: 0,
      areaTotal: 0,
      amenities: [] as string[],
      images: [] as string[],
      location: {
        placeId: null,
        country: "PH",
        city: "",
        admin1: "",
        barangay: "",
        postalCode: "",
        addressLine1: "",
        addressLine2: "",
        latitude: null,
        longitude: null,
      },
    },
  });

  const images = watch("images");

  // Per-step required checks (block "Next" until satisfied).
  const validateStep = (): string | null => {
    const v = getValues();
    switch (step) {
      case 0:
        if (!Number(v.type) || !Number(v.houseType)) return "Choose a listing type and a property type.";
        return null;
      case 1:
        if (v.location.latitude == null || v.location.longitude == null)
          return "Search an address and drop the pin on the map.";
        if (!v.location.city.trim()) return "Add a city or municipality.";
        return null;
      case 3:
        if (!v.title.trim()) return "Add a title.";
        return null;
      case 5:
        if (!Number(v.price)) return "Add a base price.";
        return null;
      default:
        return null;
    }
  };

  const goNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = async (data: IListingFormValues) => {
    const payload: IListingPayload = {
      user_id: 1,
      title: data.title,
      description: data.description,
      type: Number(data.type),
      house_type: Number(data.houseType),
      price: data.price ? Number(data.price) : null,
      discount: data.discount ? Number(data.discount) : null,
      furnished: data.furnished ? Number(data.furnished) : null,
      rooms_number: Number(data.roomsNumber) || null,
      bathrooms: Number(data.bathrooms) || null,
      parking: Number(data.parking) || null,
      area_total: data.areaTotal ? Number(data.areaTotal) : null,
      amenities: data.amenities ?? [],
      country: data.location.country || null,
      place_id: data.location.placeId,
      city_label: data.location.city || null,
      admin_name1: data.location.admin1 || null,
      barangay: data.location.barangay || null,
      postal_code: data.location.postalCode || null,
      address_line1: data.location.addressLine1 || null,
      address_line2: data.location.addressLine2 || null,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      images: data.images ?? [],
    };
    try {
      setIsSubmitting(true);
      await createListing(payload, "/listings");
      router.push("/listings");
    } catch (e) {
      console.error("Error while creating listing", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* progress */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault();
        }}
      >
        <div className="min-h-[440px]">
          {step === 0 && (
            <>
              <StepHeading title="What are you listing?" hint="Pick the kind of listing and property." />
              <CategorySection control={control} />
            </>
          )}
          {step === 1 && (
            <>
              <StepHeading title="Where is it?" hint="Search the address, then drag the pin to the exact spot." />
              <LocationSection control={control} setValue={setValue} watch={watch} />
            </>
          )}
          {step === 2 && (
            <>
              <StepHeading title="Share the basics" hint="Bedrooms, bathrooms, parking, size and furnishing." />
              <BasicsSection control={control} />
            </>
          )}
          {step === 3 && (
            <>
              <StepHeading title="Make it stand out" hint="A clear title, description and amenities." />
              <DetailsSection control={control} />
            </>
          )}
          {step === 4 && (
            <>
              <StepHeading title="Add some photos" hint="You can skip this and add them later." />
              <PhotosSection images={images} onChange={(files) => setValue("images", files)} />
            </>
          )}
          {step === 5 && (
            <>
              <StepHeading title="Now set your price" hint="Enter a base price and an optional discount." />
              <PriceSection control={control} />
            </>
          )}
          {step === 6 && (
            <>
              <StepHeading title="Review your listing" hint="Check everything, then publish." />
              <dl className="divide-y divide-gray-100 text-sm">
                <ReviewRow label="Listing type" value={ListingTypes.find((t) => t.id === Number(watch("type")))?.name} />
                <ReviewRow
                  label="Property type"
                  value={PropertyTypes.find((t) => t.id === Number(watch("houseType")))?.name}
                />
                <ReviewRow
                  label="Bed / Bath / Parking"
                  value={`${watch("roomsNumber")} · ${watch("bathrooms")} · ${watch("parking")}`}
                />
                <ReviewRow label="Floor area" value={watch("areaTotal") ? `${watch("areaTotal")} m²` : ""} />
                <ReviewRow
                  label="Furnishing"
                  value={FurnishedTypes.find((f) => f.id === Number(watch("furnished")))?.name}
                />
                <ReviewRow label="Amenities" value={`${watch("amenities")?.length ?? 0} selected`} />
                <ReviewRow label="Title" value={watch("title")} />
                <ReviewRow
                  label="Price"
                  value={
                    watch("price")
                      ? `${watch("price")}₱${watch("discount") ? ` (−${watch("discount")}%)` : ""}`
                      : ""
                  }
                />
                <ReviewRow label="Photos" value={`${images?.length ?? 0} added`} />
                <ReviewRow
                  label="Location"
                  value={[watch("location.addressLine1"), watch("location.city"), watch("location.admin1")]
                    .filter(Boolean)
                    .join(", ")}
                />
              </dl>
            </>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={goBack}
            className={`text-sm font-medium underline ${step === 0 ? "invisible" : "text-gray-700 hover:text-gray-900"}`}
          >
            Back
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Publish
              {isSubmitting && <Spinner className="h-4 w-4" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateListingWizard;
