'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface AnimatedBarChartProps {
  title: string;
  description?: string;
  data: BarData[];
  height?: number;
  animate?: boolean;
  horizontal?: boolean;
}

export function AnimatedBarChart({ 
  title, 
  description, 
  data, 
  height = 300,
  animate = true,
  horizontal = false
}: AnimatedBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) return;

    const padding = 60;
    const chartWidth = canvas.offsetWidth - padding * 2;
    const chartHeight = height - padding * 2;

    // Find max value
    const maxValue = Math.max(...data.map(d => d.value));

    if (horizontal) {
      // Horizontal bar chart
      const barHeight = chartHeight / data.length - 10;
      const barSpacing = 10;

      if (animate) {
        let progress = 0;
        const animateBars = () => {
          if (progress >= 1) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw grid lines
          ctx.strokeStyle = '#f3f4f6';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          for (let i = 0; i <= 4; i++) {
            const x = padding + (chartWidth / 4) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
          }
          ctx.setLineDash([]);

          data.forEach((item, index) => {
            const y = padding + index * (barHeight + barSpacing);
            const barWidth = (chartWidth * (item.value / maxValue)) * progress;

            // Draw bar
            ctx.fillStyle = item.color || '#3b82f6';
            ctx.fillRect(padding, y, barWidth, barHeight);

            // Draw value text
            ctx.fillStyle = '#374151';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, padding - 50, y + barHeight / 2 + 4);

            // Draw value
            ctx.textAlign = 'right';
            ctx.fillText(item.value.toString(), padding + barWidth + 10, y + barHeight / 2 + 4);
          });

          progress += 0.02;
          if (progress < 1) {
            requestAnimationFrame(animateBars);
          }
        };

        setTimeout(() => {
          requestAnimationFrame(animateBars);
        }, 300);
      } else {
        // Draw static horizontal bars
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        for (let i = 0; i <= 4; i++) {
          const x = padding + (chartWidth / 4) * i;
          ctx.beginPath();
          ctx.moveTo(x, padding);
          ctx.lineTo(x, padding + chartHeight);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        data.forEach((item, index) => {
          const y = padding + index * (barHeight + barSpacing);
          const barWidth = chartWidth * (item.value / maxValue);

          ctx.fillStyle = item.color || '#3b82f6';
          ctx.fillRect(padding, y, barWidth, barHeight);

          ctx.fillStyle = '#374151';
          ctx.font = '12px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(item.label, padding - 50, y + barHeight / 2 + 4);

          ctx.textAlign = 'right';
          ctx.fillText(item.value.toString(), padding + barWidth + 10, y + barHeight / 2 + 4);
        });
      }
    } else {
      // Vertical bar chart
      const barWidth = chartWidth / data.length - 10;
      const barSpacing = 10;

      if (animate) {
        let progress = 0;
        const animateBars = () => {
          if (progress >= 1) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw grid lines
          ctx.strokeStyle = '#f3f4f6';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
          }
          ctx.setLineDash([]);

          data.forEach((item, index) => {
            const x = padding + index * (barWidth + barSpacing);
            const barHeight = (chartHeight * (item.value / maxValue)) * progress;

            // Draw bar
            ctx.fillStyle = item.color || '#3b82f6';
            ctx.fillRect(x, padding + chartHeight - barHeight, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = '#374151';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, padding + chartHeight + 20);

            // Draw value
            ctx.fillText(item.value.toString(), x + barWidth / 2, padding + chartHeight - barHeight - 10);
          });

          progress += 0.02;
          if (progress < 1) {
            requestAnimationFrame(animateBars);
          }
        };

        setTimeout(() => {
          requestAnimationFrame(animateBars);
        }, 300);
      } else {
        // Draw static vertical bars
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        for (let i = 0; i <= 4; i++) {
          const y = padding + (chartHeight / 4) * i;
          ctx.beginPath();
          ctx.moveTo(padding, y);
          ctx.lineTo(padding + chartWidth, y);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        data.forEach((item, index) => {
          const x = padding + index * (barWidth + barSpacing);
          const barHeight = chartHeight * (item.value / maxValue);

          ctx.fillStyle = item.color || '#3b82f6';
          ctx.fillRect(x, padding + chartHeight - barHeight, barWidth, barHeight);

          ctx.fillStyle = '#374151';
          ctx.font = '12px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(item.label, x + barWidth / 2, padding + chartHeight + 20);

          ctx.fillText(item.value.toString(), x + barWidth / 2, padding + chartHeight - barHeight - 10);
        });
      }
    }

  }, [data, height, animate, horizontal, isVisible]);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full"
            style={{ height: `${height}px` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
