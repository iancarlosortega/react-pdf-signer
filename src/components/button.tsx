import * as React from "react"
import { Loader } from "../icons/Loader"
import { cn } from "../utils/cn"


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    const isDisabled = disabled || isLoading

    return (
      <Comp
        className={cn(
          "inline-flex h-10 items-center justify-center gap-x-2 rounded-md border text-gray-800 border-input bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && <Loader className="mr-2 h-4 w-4" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button }

