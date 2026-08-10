"use client";

import { Control, Controller, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FieldError from "@/components/ui/field-error";
import { IListingFormValues } from "@/types/listings";

const PriceSection = ({ control }: { control: Control<IListingFormValues> }) => {
  const price = Number(useWatch({ control, name: "price" })) || 0;
  const discountRaw = Number(useWatch({ control, name: "discount" })) || 0;
  const discount = Math.min(Math.max(discountRaw, 0), 100);
  const final = Math.round(price * (1 - discount / 100));

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 p-4">
        <label htmlFor="price" className="text-sm text-gray-500">
          Base price (₱)
        </label>
        <Controller
          name="price"
          control={control}
          rules={{ validate: (v) => Number(v) > 0 || "Add a base price." }}
          render={({ field, fieldState }) => (
            <>
              <Input {...field} error={!!fieldState.error} />
              <FieldError message={fieldState.error?.message} />
            </>
          )}
        />
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <label htmlFor="discount" className="text-sm text-gray-500">
          Discount (%)
        </label>
        <Controller
          name="discount"
          control={control}
          rules={{
            validate: (v) => {
              const n = Number(v);
              return (Number.isFinite(n) && n >= 0 && n <= 100) || "Enter a discount between 0 and 100.";
            },
          }}
          render={({ field, fieldState }) => (
            <>
              <Input {...field} error={!!fieldState.error} />
              <FieldError message={fieldState.error?.message} />
            </>
          )}
        />
        {discount > 0 && price > 0 && (
          <p className="mt-2 text-right text-sm text-gray-500">
            <span className="line-through">₱{price.toLocaleString()}</span>{" "}
            <span className="font-medium text-gray-900">₱{final.toLocaleString()}</span> after {discount}% off
          </p>
        )}
      </div>
    </div>
  );
};

export default PriceSection;
