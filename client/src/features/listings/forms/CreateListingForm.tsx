"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import FileUploader from "@/features/listings/FileUploader";
import LocationPicker from "@/features/listings/LocationPicker";
import Spinner from "@/components/ui/spinner";
import { createListing, updateListing } from "@/lib/actions/listings";
import { ListingTypes, PropertyTypes, Countries } from "@/constants/listings";
import { IListing, IListingFormValues, IListingPayload } from "@/types/listings";
import { IResolvedPlace } from "@/types/places";

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
      roomsNumber: 0,
      type: 0,
      houseType: 0,
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
      setValue("roomsNumber", l.rooms_number || 0);
      setValue("type", ListingTypes.find((t) => t.id === l.type)?.id || 0);
      setValue("houseType", PropertyTypes.find((t) => t.id === l.house_type)?.id || 0);
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
  const latitude = watch("location.latitude");
  const longitude = watch("location.longitude");

  const handleResolve = (place: IResolvedPlace) => {
    setValue("location.placeId", place.placeId);
    if (place.country) setValue("location.country", place.country);
    setValue("location.city", place.city ?? "");
    setValue("location.admin1", place.admin1 ?? "");
    setValue("location.barangay", place.barangay ?? "");
    setValue("location.postalCode", place.postalCode ?? "");
    setValue("location.addressLine1", place.addressLine1 ?? "");
    setValue("location.latitude", place.latitude);
    setValue("location.longitude", place.longitude);
  };

  // Dragging the map pin adjusts only the coordinates.
  const handlePinChange = (lat: number, lng: number) => {
    setValue("location.latitude", lat);
    setValue("location.longitude", lng);
  };

  const onSubmit = async (data: IListingFormValues) => {
    const payload: IListingPayload = {
      user_id: 1,
      title: data.title,
      description: data.description,
      type: Number(data.type),
      house_type: Number(data.houseType),
      price: data.price ? Number(data.price) : null,
      rooms_number: data.roomsNumber ? Number(data.roomsNumber) : null,
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
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="title">Title</label>
          <Controller name="title" control={control} render={({ field }) => <Input {...field} />} />
        </div>
        <div>
          <label htmlFor="type">Listing type</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => <Select {...field} options={ListingTypes} keyValue="id" />}
          />
        </div>
        <div>
          <label htmlFor="type">Property type</label>
          <Controller
            name="houseType"
            control={control}
            render={({ field }) => <Select {...field} options={PropertyTypes} keyValue="id" />}
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <Controller name="description" control={control} render={({ field }) => <Textarea {...field} />} />
        </div>
        <div>
          <label htmlFor="price">Price</label>
          <Controller name="price" control={control} render={({ field }) => <Input {...field} />} />
        </div>
        <div>
          <label htmlFor="roomsNumber">Rooms Number</label>
          <Controller name="roomsNumber" control={control} render={({ field }) => <Input {...field} />} />
        </div>
        <div>
          <label htmlFor="images">Images</label>
          <FileUploader images={images} onChange={(files) => setValue("images", files)} />
        </div>
        <button
          type="submit"
          disabled={isUpdating}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base w-60 h-10 sm:h-12 px-4 sm:px-5"
        >
          {props?.type === "edit" ? "Update" : "Submit"}
          {isUpdating && <Spinner className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          initialAddress={props.listing?.address_line1 ?? ""}
          onResolve={handleResolve}
          onPinChange={handlePinChange}
        />
        <div>
          <label htmlFor="country">Country</label>
          <Controller
            name="location.country"
            control={control}
            render={({ field }) => <Select {...field} options={Countries} keyValue="code" />}
          />
        </div>
        <div>
          <label htmlFor="city">City / Municipality</label>
          <Controller name="location.city" control={control} render={({ field }) => <Input {...field} />} />
        </div>
        <div>
          <label htmlFor="admin1">Province</label>
          <Controller name="location.admin1" control={control} render={({ field }) => <Input {...field} />} />
        </div>
        <div>
          <label htmlFor="barangay">Barangay</label>
          <Controller name="location.barangay" control={control} render={({ field }) => <Input {...field} />} />
        </div>
        <div>
          <label htmlFor="postalCode">Postal code</label>
          <Controller name="location.postalCode" control={control} render={({ field }) => <Input {...field} />} />
        </div>
        <div>
          <label htmlFor="addressLine1">Address Line 1</label>
          <Controller name="location.addressLine1" control={control} render={({ field }) => <Input {...field} />} />
        </div>
        <div>
          <label htmlFor="addressLine2">Address Line 2</label>
          <Controller name="location.addressLine2" control={control} render={({ field }) => <Input {...field} />} />
        </div>
      </div>
    </form>
  );
};

export default CreateListingForm;
