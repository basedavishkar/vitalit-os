import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'colored' | 'strong'
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', color = 'blue', children, ...props }, ref) => {
    const baseClasses = "rounded-xl backdrop-blur-md border border-white/20"
    
    const variantClasses = {
      default: "bg-white/80 shadow-soft-md",
      colored: `bg-white/80 shadow-soft-md`,
      strong: "bg-white/90 shadow-glass-strong"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          "transition-all duration-300 hover:shadow-soft-lg hover:scale-[1.02]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard } 