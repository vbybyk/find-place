"use client";

import { ReactNode } from "react";
import { Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import Stepper from "@/components/ui/stepper";
import OptionCards from "../OptionCards";
import { FurnishedTypes } from "@/constants/listings";
import { IListingFormValues } from "@/types/listings";

const furnishedOptions = FurnishedTypes.map((f) => ({ value: f.id, label: f.name }));

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0">
    <span className="text-gray-800">{label}</span>
    {children}
  </div>
);

const BasicsSection = ({ control }: { control: Control<IListingFormValues> }) => (
  <div className="flex flex-col gap-6">
    <div className="rounded-xl border border-gray-200 px-4">
      <Controller
        name="roomsNumber"
        control={control}
        render={({ field }) => (
          <Row label="Bedrooms">
            <Stepper label="bedrooms" value={field.value} onChange={field.onChange} min={0} max={20} />
          </Row>
        )}
      />
      <Controller
        name="bathrooms"
        control={control}
        render={({ field }) => (
          <Row label="Bathrooms">
            <Stepper label="bathrooms" value={field.value} onChange={field.onChange} min={0} max={20} />
          </Row>
        )}
      />
      <Controller
        name="parking"
        control={control}
        render={({ field }) => (
          <Row label="Parking spaces">
            <Stepper label="parking spaces" value={field.value} onChange={field.onChange} min={0} max={20} />
          </Row>
        )}
      />
    </div>

    <div>
      <label htmlFor="areaTotal" className="mb-1 block">
        Floor area (m²)
      </label>
      <Controller name="areaTotal" control={control} render={({ field }) => <Input {...field} />} />
    </div>

    <div>
      <label className="mb-2 block">Furnishing</label>
      <Controller
        name="furnished"
        control={control}
        render={({ field }) => (
          <OptionCards columns={3} options={furnishedOptions} value={field.value} onChange={field.onChange} />
        )}
      />
    </div>
  </div>
);

export default BasicsSection;
