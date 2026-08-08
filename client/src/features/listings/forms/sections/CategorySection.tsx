"use client";

import { Control, Controller } from "react-hook-form";
import { KeyIcon, BanknotesIcon, BuildingOffice2Icon, HomeModernIcon } from "@heroicons/react/24/outline";
import OptionCards from "../OptionCards";
import { ListingTypes, PropertyTypes } from "@/constants/listings";
import { IListingFormValues } from "@/types/listings";

const iconCls = "h-7 w-7";
const LISTING_ICONS: Record<number, React.ReactNode> = {
  1: <KeyIcon className={iconCls} />,
  2: <BanknotesIcon className={iconCls} />,
};
const PROPERTY_ICONS: Record<number, React.ReactNode> = {
  1: <BuildingOffice2Icon className={iconCls} />,
  2: <HomeModernIcon className={iconCls} />,
};

const listingOptions = ListingTypes.map((t) => ({ value: t.id, label: t.name, icon: LISTING_ICONS[t.id] }));
const propertyOptions = PropertyTypes.map((t) => ({ value: t.id, label: t.name, icon: PROPERTY_ICONS[t.id] }));

const CategorySection = ({ control }: { control: Control<IListingFormValues> }) => (
  <div className="flex flex-col gap-6">
    <div>
      <label className="mb-2 block font-medium">Listing type</label>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <OptionCards options={listingOptions} value={field.value} onChange={field.onChange} />
        )}
      />
    </div>
    <div>
      <label className="mb-2 block font-medium">Property type</label>
      <Controller
        name="houseType"
        control={control}
        render={({ field }) => (
          <OptionCards options={propertyOptions} value={field.value} onChange={field.onChange} />
        )}
      />
    </div>
  </div>
);

export default CategorySection;
