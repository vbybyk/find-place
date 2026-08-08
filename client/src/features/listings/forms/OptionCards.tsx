"use client";

import { ReactNode } from "react";
import clsx from "clsx";

export interface IOptionCard {
  value: number | string;
  label: string;
  icon?: ReactNode;
}

interface IProps {
  options: IOptionCard[];
  value: number | string;
  onChange: (value: number | string) => void;
  columns?: number;
}

const OptionCards = ({ options, value, onChange, columns = 2 }: IProps) => (
  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
    {options.map((opt) => {
      const selected = String(value) === String(opt.value);
      return (
        <button
          key={opt.value}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition",
            selected ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-400"
          )}
        >
          {opt.icon && <span className="text-gray-900">{opt.icon}</span>}
          <span className="text-sm font-medium text-gray-900">{opt.label}</span>
        </button>
      );
    })}
  </div>
);

export default OptionCards;
