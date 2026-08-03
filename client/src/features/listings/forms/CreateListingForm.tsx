"use client";

import { SyntheticEvent, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import Autocomplete from "@/components/ui/autocomplete";
import FileUploader from "@/features/listings/FileUploader";
import Spinner from "@/components/ui/spinner";
import { createListing, updateListing, searchListingCity } from "@/lib/actions/listings";
import { ListingTypes, PropertyTypes, Countries } from "@/constants/listings";
import { ICityOption, IListing, IListingFormValues, IListingPayload } from "@/types/listings";

interface IProps {
  listing?: IListing;
  type?: "edit" | "create";
}

const CreateListingForm = (props: IProps) => {
  const router = useRouter();
  const [citiesOptions, setCitiesOptions] = useState<ICityOption[]>([]);
  const [cityInput, setCityInput] = useState("");
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
        country: "PH",
        city: null,
        addressLine1: "",
        addressLine2: "",
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
        country: l.country ?? "PH",
        city:
          l.city_id != null
            ? { id: l.city_id, label: l.city_label ?? "", adminName1: l.admin_name1 ?? undefined }
            : null,
        addressLine1: l.address_line1 ?? "",
        addressLine2: l.address_line2 ?? "",
      });
      if (l.city_label) {
        setCityInput(l.city_label);
      }
    }
  }, [props.listing]);

  const images = watch("images");
  const country = watch("location.country");

  const getSitiesOptions = async (country: string) => {
    const result = await searchListingCity("", country, "500");
    setCitiesOptions(result);
  };

  useEffect(() => {
    if (country) {
      getSitiesOptions(country);
    }
  }, [country]);

  const onCityInputChange = (_e: SyntheticEvent<Element, Event>, value: string) => {
    if (value !== cityInput) {
      setCityInput(value);
    }
  };

  const handleCityChange = (value: ICityOption | null) => {
    if (value && value.label !== cityInput) {
      setCityInput(value.label);
      setValue("location.city", value);
    }
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
      city_id: data.location.city?.id ?? null,
      city_label: data.location.city?.label ?? null,
      admin_name1: data.location.city?.adminName1 ?? null,
      address_line1: data.location.addressLine1 || null,
      address_line2: data.location.addressLine2 || null,
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
        <div>
          <label htmlFor="location">Country</label>
          <Controller
            name="location.country"
            control={control}
            render={({ field }) => <Select {...field} options={Countries} keyValue="code" />}
          />
        </div>
        <div>
          <label htmlFor="location">City</label>
          <Controller
            name="location.city"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={citiesOptions}
                inputValue={cityInput}
                onInputChange={onCityInputChange}
                onChange={handleCityChange}
              />
            )}
          />
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
