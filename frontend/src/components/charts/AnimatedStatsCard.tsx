'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedStatsCardProps {
  title: string;
  value: number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  description?: string;
  formatValue?: (value: number) => string;
  delay?: number;
}

export function AnimatedStatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'blue',
  description,
  formatValue = (val) => val.toLocaleString(),
  delay = 0
}: AnimatedStatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      let startValue = 0;
      const endValue = value;
      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, value, delay]);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      light: 'bg-blue-50',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      light: 'bg-green-50',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      light: 'bg-purple-50',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      light: 'bg-orange-50',
      border: 'border-orange-200'
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      light: 'bg-red-50',
      border: 'border-red-200'
    }
  };

  const changeClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "animate-fade-in transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        colorClasses[color].border
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "p-2 rounded-xl shadow-sm",
            colorClasses[color].light
          )}>
            <div className={cn(
              "w-6 h-6",
              colorClasses[color].text
            )}>
              {icon}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold text-gray-900">
          {formatValue(displayValue)}
        </div>
        {change && (
          <div className="flex items-center gap-1">
            <span className={cn(
              "text-sm font-medium",
              changeClasses[changeType]
            )}>
              {change}
            </span>
            {changeType === 'positive' && (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l3-3m0 0l3 3m-3-3v7m-4-4l4 4m0 0l4-4m-4 4V3" />
              </svg>
            )}
            {changeType === 'negative' && (
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 10l-3-3m0 0l-3 3m3-3v7m4-4l4 4m0 0l4-4m-4 4V3" />
              </svg>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
