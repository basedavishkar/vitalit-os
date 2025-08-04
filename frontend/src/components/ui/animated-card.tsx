"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  delay?: number
  variant?: 'default' | 'glass' | 'elevated'
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, delay = 0, variant = 'default', children, ...props }, ref) => {
    const variants = {
      hidden: { 
        opacity: 0, 
        y: 20,
        scale: 0.95
      },
      visible: { 
        opacity: 1, 
        y: 0,
        scale: 1
      }
    }

    const variantClasses = {
      default: "bg-white shadow-soft-md border border-gray-100",
      glass: "bg-white/80 backdrop-blur-md border border-white/20 shadow-glass-soft",
      elevated: "bg-white shadow-soft-lg border border-gray-100"
    }

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={variants}
        transition={{
          duration: 0.4,
          delay: delay * 0.1,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        whileHover={{
          y: -4,
          transition: { duration: 0.2 }
        }}
        className={cn(
          "rounded-xl p-6 transition-all duration-300",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard } 