"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

interface IStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string; // used for accessible button names
}

const Stepper = ({ value, onChange, min = 0, max = 50, label }: IStepperProps) => {
  const dec = () => onChange(Math.max(min, (value || 0) - 1));
  const inc = () => onChange(Math.min(max, (value || 0) + 1));

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="flex items-center gap-4">
      <button type="button" aria-label={`Decrease ${label}`} onClick={dec} disabled={value <= min} className={btn}>
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-base tabular-nums">{value || 0}</span>
      <button type="button" aria-label={`Increase ${label}`} onClick={inc} disabled={value >= max} className={btn}>
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Stepper;
