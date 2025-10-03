"use client";
import React, { forwardRef, SyntheticEvent } from "react";
import { Autocomplete as BaseUIAutocomplete } from "@base-ui-components/react/autocomplete";
import clsx from "clsx";

interface IAutocompleteProps {
  inputValue?: string;
  onInputChange?: (event: SyntheticEvent<Element, Event>, value: string, reason: "input" | "reset" | "clear") => void;
  options: any[];
  isOptionEqualToValue?: (option: any, value: any) => boolean;
  disableClearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  value: any;
  onChange: (value: any) => void;
}

interface IOption {
  id: string;
  label: string;
  adminName1?: string;
}

const Autocomplete = forwardRef<HTMLDivElement, IAutocompleteProps>((props, _ref) => {
  const {
    inputValue,
    onInputChange,
    options,
    disableClearable = false,
    disabled = false,
    readOnly = false,
    className,
    onChange,
  } = props;

  return (
    <BaseUIAutocomplete.Root
      autoHighlight
      value={inputValue}
      onValueChange={(newInputValue) => {
        if (onInputChange) {
          onInputChange(new Event("input") as unknown as SyntheticEvent, newInputValue, "input");
        }
      }}
      items={options}
    >
      <div className={clsx("relative w-full")}>
        <BaseUIAutocomplete.Input
          disabled={disabled}
          readOnly={readOnly}
          className={clsx(
            "overflow-hidden text-sm leading-[1.5] text-gray-900 dark:text-gray-300 bg-white px-3 py-2 outline-0 border border-solid border-gray-200",
            "focus-within:border-violet-400 dark:focus-within:border-violet-400 focus-within:shadow-[0_0_0_1px_transparent] focus-within:shadow-violet-200 dark:focus-within:shadow-violet-500 focus-within:outline-0",
            "dark:bg-gray-800, dark:border-gray-700",
            className
          )}
          placeholder="Type to search..."
        />
        {!disableClearable && !disabled && inputValue && !readOnly && (
          <BaseUIAutocomplete.Clear
            onClick={() => {
              if (onChange) onChange(null);
              if (onInputChange) {
                onInputChange(new Event("clear") as unknown as SyntheticEvent, "", "clear");
              }
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 self-center outline-0 shadow-none border-0 py-0 px-0.5 rounded-[4px] bg-transparent hover:bg-violet-100 dark:hover:bg-gray-700 hover:cursor-pointer"
          >
            <ClearIcon />
          </BaseUIAutocomplete.Clear>
        )}
      </div>
      <BaseUIAutocomplete.Portal>
        <BaseUIAutocomplete.Positioner sideOffset={-8}>
          <BaseUIAutocomplete.Popup className="text-sm box-border p-1.5 my-3 mx-0 w-[400px] rounded-xl overflow-auto outline-0 max-h-[300px] z-[1] bg-white dark:bg-gray-800 border border-solid border-gray-200 dark:border-gray-900 text-gray-900 dark:text-gray-200 shadow-[0_4px_30px_transparent] shadow-gray-200 dark:shadow-gray-900">
            {options.length === 0 && (
              <BaseUIAutocomplete.Empty className="list-none p-2 cursor-default">No results</BaseUIAutocomplete.Empty>
            )}
            <BaseUIAutocomplete.List>
              {(option: IOption, index: number) => (
                <BaseUIAutocomplete.Item
                  key={`${option.id}-${index}`}
                  value={option}
                  onClick={() => onChange?.(option)}
                  className={({ highlighted, selected }) =>
                    clsx(
                      "flex items-center list-none p-2 rounded-lg cursor-default last-of-type:border-b-0 hover:cursor-pointer",
                      selected && "bg-violet-100 dark:bg-violet-900 text-violet-900 dark:text-violet-100",
                      highlighted && !selected && "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300",
                      highlighted &&
                        selected &&
                        "bg-violet-100 dark:bg-violet-900 text-violet-900 dark:text-violet-100",
                      !highlighted && !selected && "hover:cursor-pointer"
                    )
                  }
                >
                  <span>{option.label}</span>
                  {option.adminName1 && <span className="ml-2.5 text-xs text-gray-400">{option.adminName1}</span>}
                </BaseUIAutocomplete.Item>
              )}
            </BaseUIAutocomplete.List>
          </BaseUIAutocomplete.Popup>
        </BaseUIAutocomplete.Positioner>
      </BaseUIAutocomplete.Portal>
    </BaseUIAutocomplete.Root>
  );
});

Autocomplete.displayName = "Autocomplete";

function ClearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4 scale-90"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default Autocomplete;
