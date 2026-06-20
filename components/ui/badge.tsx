import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        outline: 'border bg-transparent',
        destructive: 'bg-red-100 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const variantStyles: React.CSSProperties = {}

  if (variant === 'default' || !variant) {
    variantStyles.backgroundColor = 'var(--primary)'
    variantStyles.color = '#ffffff'
  } else if (variant === 'secondary') {
    variantStyles.backgroundColor = 'var(--muted)'
    variantStyles.color = 'var(--muted-foreground)'
  } else if (variant === 'outline') {
    variantStyles.borderColor = 'var(--border)'
    variantStyles.color = 'var(--foreground)'
  }

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...variantStyles, ...style }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
