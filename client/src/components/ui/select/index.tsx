"use client";

import React, { forwardRef } from "react";
import { Select as BaseUISelect } from "@base-ui-components/react/select";
import clsx from "clsx";

interface ISelectProps {
  value: any;
  options: any[];
  onChange: (value: any) => void;
  keyValue?: string;
  placeholder?: string;
}

const Select = forwardRef<HTMLButtonElement, ISelectProps>((props, ref) => {
  const { options, keyValue, value, onChange, placeholder } = props;

  const items = options.map((option) => ({
    label: option.name,
    value: keyValue ? option[keyValue] : option.id,
  }));

  return (
    <BaseUISelect.Root value={value} onValueChange={(newValue) => onChange?.(newValue)} items={items}>
      <BaseUISelect.Trigger
        ref={ref}
        className="flex items-center justify-between text-sm font-sans box-border w-80 h-10 px-3 py-2 rounded-lg text-left bg-white dark:bg-neutral-900 border border-solid border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-300 transition-all hover:bg-slate-50 dark:hover:bg-neutral-800 outline-0 shadow-md shadow-slate-100 dark:shadow-slate-900 focus-visible:ring-4 focus-visible:ring-purple-500/30 focus-visible:border-purple-500 focus-visible:dark:border-purple-500"
      >
        {value ? <BaseUISelect.Value /> : <span className="text-slate-900 dark:text-slate-300">{placeholder}</span>}
        <BaseUISelect.Icon className="flex">
          <ChevronUpDownIcon />
        </BaseUISelect.Icon>
      </BaseUISelect.Trigger>

      <BaseUISelect.Portal>
        <BaseUISelect.Positioner sideOffset={-12} alignItemWithTrigger={false}>
          <BaseUISelect.Popup
            className={() =>
              clsx(
                "text-sm font-sans p-1.5 my-3 w-80 rounded-xl overflow-auto outline-0 bg-white dark:bg-slate-900 border border-solid border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 shadow shadow-slate-200 dark:shadow-slate-900 transition-[opacity,transform]"
              )
            }
          >
            {items.map((item) => (
              <BaseUISelect.Item
                key={item.value}
                value={item.value}
                className={({ selected, highlighted, disabled }) =>
                  clsx(
                    "flex items-center list-none p-2 rounded-lg cursor-default last-of-type:border-b-0",
                    disabled && "text-slate-400 dark:text-slate-700",
                    !disabled && selected && "bg-purple-100 dark:bg-purple-950 text-purple-950 dark:text-purple-50",
                    !disabled &&
                      highlighted &&
                      !selected &&
                      "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300",
                    !disabled &&
                      "hover:bg-slate-100 hover:dark:bg-slate-800 hover:text-slate-900 hover:dark:text-slate-300",
                    !disabled &&
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400 focus-visible:dark:outline-purple-300"
                  )
                }
              >
                <BaseUISelect.ItemText>{item.label}</BaseUISelect.ItemText>
                <BaseUISelect.ItemIndicator className="ml-auto">
                  <CheckIcon />
                </BaseUISelect.ItemIndicator>
              </BaseUISelect.Item>
            ))}
          </BaseUISelect.Popup>
        </BaseUISelect.Positioner>
      </BaseUISelect.Portal>
    </BaseUISelect.Root>
  );
});

Select.displayName = "Select";

function ChevronUpDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10">
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

export default Select;
