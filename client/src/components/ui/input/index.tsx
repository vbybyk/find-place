import * as React from "react";

import cn from "classnames";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={error || undefined}
        className={cn("ui-input h-10", error && "ui-input-error", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
