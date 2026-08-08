"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import CategorySection from "./sections/CategorySection";
import BasicsSection from "./sections/BasicsSection";
import DetailsSection from "./sections/DetailsSection";
import PriceSection from "./sections/PriceSection";
import PhotosSection from "./sections/PhotosSection";
import LocationSection from "./sections/LocationSection";
import { createListing, updateListing } from "@/lib/actions/listings";
import { ListingTypes, PropertyTypes } from "@/constants/listings";
import { IListing, IListingFormValues, IListingPayload } from "@/types/listings";

interface IProps {
  listing?: IListing;
  type?: "edit" | "create";
}

const CreateListingForm = (props: IProps) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<IListingFormValues>({
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
      roomsNumber: 0,
      bathrooms: 0,
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

  useEffect(() => {
    if (props.listing) {
      const l = props.listing;
      setValue("userId", l.user_id);
      setValue("title", l.title);
      setValue("description", l.description);
      setValue("price", l.price || 0);
      setValue("discount", l.discount || 0);
      setValue("roomsNumber", l.rooms_number || 0);
      setValue("bathrooms", l.bathrooms || 0);
      setValue("parking", l.parking || 0);
      setValue("areaTotal", l.area_total || 0);
      setValue("furnished", l.furnished || 0);
      setValue("type", ListingTypes.find((t) => t.id === l.type)?.id || 0);
      setValue("houseType", PropertyTypes.find((t) => t.id === l.house_type)?.id || 0);
      if (l.amenities?.length) {
        setValue("amenities", l.amenities);
      }
      if (l.images?.length) {
        setValue("images", l.images);
      }
      setValue("location", {
        placeId: l.place_id ?? null,
        country: l.country ?? "PH",
        city: l.city_label ?? "",
        admin1: l.admin_name1 ?? "",
        barangay: l.barangay ?? "",
        postalCode: l.postal_code ?? "",
        addressLine1: l.address_line1 ?? "",
        addressLine2: l.address_line2 ?? "",
        latitude: l.latitude ?? null,
        longitude: l.longitude ?? null,
      });
    }
  }, [props.listing]);

  const images = watch("images");

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
      setIsUpdating(true);
      if (props?.type === "edit" && props.listing) {
        const listingId = props.listing.id;
        await updateListing(listingId, payload, `/listings/${listingId}`);
      } else {
        await createListing(payload, "/listings");
        router.push("/listings");
      }
    } catch (error) {
      console.error("Error while creating listing in form", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-16">
      <div className="flex flex-col gap-8">
        <CategorySection control={control} />
        <BasicsSection control={control} />
        <DetailsSection control={control} />
        <PriceSection control={control} />
        <PhotosSection images={images} onChange={(files) => setValue("images", files)} />
        <button
          type="submit"
          disabled={isUpdating}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base w-60 h-10 sm:h-12 px-4 sm:px-5"
        >
          {props?.type === "edit" ? "Update" : "Submit"}
          {isUpdating && <Spinner className="w-5 h-5" />}
        </button>
      </div>
      <LocationSection
        control={control}
        setValue={setValue}
        watch={watch}
        initialAddress={props.listing?.address_line1 ?? ""}
      />
    </form>
  );
};

export default CreateListingForm;
