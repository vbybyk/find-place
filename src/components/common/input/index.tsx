import * as React from "react";

import cn from "classnames";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm gap-[5px] pr-[5px] overflow-hidden w-80 rounded-lg placeholder:text-muted-foreground bg-white dark:bg-gray-800 border border-solid border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-400 focus-visible:outline-0 shadow-[0_2px_4px_rgb(0_0_0_/_0.05)] dark:shadow-[0_2px_4px_rgb(0_0_0_/_0.5)]",
          "shadow-[0_2px_2px_transparent] shadow-gray-50 dark:shadow-gray-900 disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-violet-400  focus-visible:shadow-[0_0_0_3px_transparent]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
