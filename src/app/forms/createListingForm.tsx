"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "../../components/common/input";
import { Textarea } from "../../components/common/textarea";
import Select from "../../components/common/select";
import Autocomplete from "../../components/common/autocomplete";
import FileUploader from "@/components/fileUploader";
import Spinner from "@/components/common/spinner";
import { createListing, updateListing, searchListingCity } from "@/lib/actions/listings";
import { IListing } from "@/lib/database/models/listing";

const ListingTypes = [
  { id: 1, name: "Rent" },
  { id: 2, name: "Sale" },
];

const PropertyTypes = [
  { id: 1, name: "Apartment" },
  { id: 2, name: "House" },
];

const Countries = [
  { id: 1, code: "PH", name: "Philippines" },
  { id: 2, code: "ID", name: "Indonesia" },
];

interface IProps {
  listing?: IListing;
  type?: "edit" | "create";
}

const CreateListingForm = (props: IProps) => {
  const router = useRouter();
  const [citiesOptions, setCitiesOptions] = useState([]);
  const [cityInput, setCityInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm({
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
      const { title, description, price, roomsNumber, type, houseType, userId } = props.listing;
      setValue("userId", userId);
      setValue("title", title);
      setValue("description", description);
      setValue("price", price || 0);
      setValue("roomsNumber", roomsNumber || 0);
      setValue("type", ListingTypes.find((t) => t.id === type)?.id || 0);
      setValue("houseType", PropertyTypes.find((t) => t.id === houseType)?.id || 0);
      if (props.listing.images?.length) {
        setValue("images", props.listing.images);
      }
      if (props.listing?.location) {
        setValue("location", props.listing?.location || {});
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

  const onCityInputChange = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value !== cityInput) {
      setCityInput(value);
    }
  };

  const handleCityChange = (event: any, value: any) => {
    if (value && value.label !== cityInput) {
      setCityInput(value.label);
      setValue("location.city", value);
    }
  };

  const onSubmit = async (data: any) => {
    console.log("onSubmit", data);
    const newListing = {
      ...data,
      userId: 1,
      type: data.type,
      houseType: data.houseType,
      price: parseInt(data.price),
      roomsNumber: parseInt(data.roomsNumber),
    };
    try {
      setIsUpdating(true);
      if (props?.type === "edit" && props.listing) {
        const listingId = props.listing._id;
        await updateListing(listingId, newListing, `/listings/${listingId}`);
      } else {
        await createListing(newListing, "/listings");
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
