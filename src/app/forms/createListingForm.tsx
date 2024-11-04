"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "../../components/common/input";
import { Textarea } from "../../components/common/textarea";
import Select from "../../components/common/select";
import { createListing } from "@/lib/actions/listings";
import { IListing } from "@/lib/database/models/listing";

const ListingTypes = [
  { id: 1, name: "Rent" },
  { id: 2, name: "Sale" },
];

const PropertyTypes = [
  { id: 1, name: "Apartment" },
  { id: 2, name: "House" },
];

interface IProps {
  listing?: IListing;
}

const CreateListingForm = (props: IProps) => {
  const router = useRouter();
  const { control, handleSubmit, setValue } = useForm({
    mode: "all",
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      roomsNumber: 0,
      type: 0,
      houseType: 0,
    },
  });

  useEffect(() => {
    if (props.listing) {
      const { title, description, price, roomsNumber, type, houseType } = props.listing;
      setValue("title", title);
      setValue("description", description);
      setValue("price", price || 0);
      setValue("roomsNumber", roomsNumber || 0);
      setValue("type", ListingTypes.find((t) => t.id === type)?.id || 0);
      setValue("houseType", PropertyTypes.find((t) => t.id === houseType)?.id || 0);
    }
  }, [props.listing]);

  const onSubmit = async (data: any) => {
    console.log("onSubmit", data);
    // const newListing = {
    //   ...data,
    //   type: data.type.id,
    //   houseType: data.houseType.id,
    //   price: parseInt(data.price),
    //   roomsNumber: parseInt(data.roomsNumber),
    // };
    // try {
    //   await createListing(newListing, "/listings");
    //   router.push("/listings");
    // } catch (error) {
    //   console.error("Error while creating listing in form", error);
    // }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-1/2">
      <div>
        <label htmlFor="title">Title</label>
        <Controller name="title" control={control} render={({ field }) => <Input {...field} />} />
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
      <button
        type="submit"
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base w-60 h-10 sm:h-12 px-4 sm:px-5"
      >
        Submit
      </button>
    </form>
  );
};

export default CreateListingForm;
