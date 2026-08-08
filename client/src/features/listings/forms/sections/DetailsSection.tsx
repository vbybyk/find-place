"use client";

import { Control, Controller } from "react-hook-form";
import clsx from "clsx";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Amenities } from "@/constants/listings";
import { IListingFormValues } from "@/types/listings";

const DetailsSection = ({ control }: { control: Control<IListingFormValues> }) => (
  <div className="flex flex-col gap-4">
    <div>
      <label htmlFor="title">Title</label>
      <Controller name="title" control={control} render={({ field }) => <Input {...field} />} />
    </div>
    <div>
      <label htmlFor="description">Description</label>
      <Controller name="description" control={control} render={({ field }) => <Textarea {...field} />} />
    </div>
    <div>
      <label className="mb-2 block">Amenities</label>
      <Controller
        name="amenities"
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {Amenities.map((a) => {
              const active = field.value?.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    const set = new Set(field.value ?? []);
                    if (active) set.delete(a.key);
                    else set.add(a.key);
                    field.onChange([...set]);
                  }}
                  className={clsx(
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    active
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 text-gray-700 hover:border-gray-500"
                  )}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        )}
      />
    </div>
  </div>
);

export default DetailsSection;
