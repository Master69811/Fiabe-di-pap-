'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'text-white shadow-md hover:shadow-lg active:scale-95',
        outline:
          'border-2 bg-transparent shadow-sm hover:shadow-md active:scale-95',
        ghost:
          'hover:bg-black/5 active:scale-95',
        secondary:
          'shadow-sm hover:shadow-md active:scale-95',
        destructive:
          'bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-95',
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
      variantStyles.color = 'var(--primary-foreground, #ffffff)'
    } else if (variant === 'outline') {
      variantStyles.borderColor = 'var(--primary)'
      variantStyles.color = 'var(--primary)'
    } else if (variant === 'secondary') {
      variantStyles.backgroundColor = 'var(--secondary)'
      variantStyles.color = '#1a4a32'
    } else if (variant === 'ghost') {
      variantStyles.color = 'var(--foreground)'
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
