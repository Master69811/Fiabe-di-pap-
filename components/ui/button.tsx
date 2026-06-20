'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'text-white active:scale-95',
        outline:
          'border bg-transparent active:scale-95',
        ghost:
          'active:scale-95',
        secondary:
          'active:scale-95',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:scale-95',
        link: 'underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-13 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  primaryColor?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, primaryColor, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const variantStyles: React.CSSProperties = {}

    if (variant === 'default' || !variant) {
      variantStyles.backgroundColor = 'var(--primary)'
      variantStyles.color = '#ffffff'
    } else if (variant === 'outline') {
      variantStyles.borderColor = 'var(--border)'
      variantStyles.color = 'var(--foreground)'
    } else if (variant === 'secondary') {
      variantStyles.backgroundColor = 'var(--surface-2)'
      variantStyles.color = 'var(--foreground)'
    } else if (variant === 'ghost') {
      variantStyles.color = 'var(--muted-foreground)'
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{ ...variantStyles, ...style }}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
