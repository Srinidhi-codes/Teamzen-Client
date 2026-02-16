import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-4 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:opacity-95 hover:-translate-y-0.5 focus-visible:ring-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-2xl shadow-destructive/20 hover:opacity-95 hover:-translate-y-0.5 focus-visible:ring-destructive/20",
        outline:
          "border border-border/50 bg-background shadow-xs hover:bg-muted hover:text-foreground focus-visible:ring-primary/10",
        secondary:
          "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground focus-visible:ring-primary/10",
        ghost:
          "hover:bg-muted hover:text-foreground focus-visible:ring-primary/10",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[52px] px-10 py-4",
        xs: "h-8 gap-1 rounded-xl px-3 text-[9px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 rounded-xl gap-1.5 px-4",
        lg: "h-14 rounded-3xl px-12",
        icon: "size-[52px] rounded-2xl p-0",
        "icon-xs": "size-8 rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-10 rounded-xl",
        "icon-lg": "size-14 rounded-3xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
