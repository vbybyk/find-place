"use client";

import { Control, Controller, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FieldError from "@/components/ui/field-error";
import LocationPicker from "@/features/listings/LocationPicker";
import { IListingFormValues } from "@/types/listings";
import { IResolvedPlace } from "@/types/places";

interface IProps {
  control: Control<IListingFormValues>;
  setValue: UseFormSetValue<IListingFormValues>;
  watch: UseFormWatch<IListingFormValues>;
  initialAddress?: string;
}

const LocationSection = ({ control, setValue, watch, initialAddress }: IProps) => {
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

  const handlePinChange = (lat: number, lng: number) => {
    setValue("location.latitude", lat);
    setValue("location.longitude", lng);
  };

  return (
    <div className="flex flex-col gap-4">
      <LocationPicker
        latitude={latitude}
        longitude={longitude}
        initialAddress={initialAddress ?? ""}
        onResolve={handleResolve}
        onPinChange={handlePinChange}
      />
      {/* No rendered input — surfaces the pin error set by the wizard's step guard. */}
      <Controller
        name="location.latitude"
        control={control}
        render={({ fieldState }) => <FieldError message={fieldState.error?.message} />}
      />
      <div>
        <label htmlFor="city">City / Municipality</label>
        <Controller
          name="location.city"
          control={control}
          rules={{ required: "Add a city or municipality." }}
          render={({ field, fieldState }) => (
            <>
              <Input {...field} error={!!fieldState.error} />
              <FieldError message={fieldState.error?.message} />
            </>
          )}
        />
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
  );
};

export default LocationSection;
