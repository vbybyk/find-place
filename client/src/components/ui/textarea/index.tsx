import * as React from "react";

import cn from "classnames";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => {
  return (
    <textarea
      aria-invalid={error || undefined}
      className={cn("ui-input min-h-[80px]", error && "ui-input-error", className)}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
