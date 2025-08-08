'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnimatedLineChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  height?: number;
  showGrid?: boolean;
  animate?: boolean;
}

export function AnimatedLineChart({ 
  title, 
  description, 
  data, 
  height = 200, 
  showGrid = true,
  animate = true 
}: AnimatedLineChartProps) {
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

    const padding = 40;
    const chartWidth = canvas.offsetWidth - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min and max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#f3f4f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // Draw line
    if (animate) {
      let progress = 0;
      const animateLine = () => {
        if (progress >= 1) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw grid
        if (showGrid) {
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
        }

        // Draw animated line
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          const x = padding + (chartWidth / (data.length - 1)) * i;
          const normalizedValue = (data[i].value - minValue) / valueRange;
          const y = padding + chartHeight - (chartHeight * normalizedValue * progress);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Draw animated dots
        ctx.fillStyle = '#3b82f6';
        for (let i = 0; i < data.length; i++) {
          const x = padding + (chartWidth / (data.length - 1)) * i;
          const normalizedValue = (data[i].value - minValue) / valueRange;
          const y = padding + chartHeight - (chartHeight * normalizedValue * progress);

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }

        progress += 0.02;
        if (progress < 1) {
          requestAnimationFrame(animateLine);
        }
      };

      setTimeout(() => {
        requestAnimationFrame(animateLine);
      }, 300);
    } else {
      // Draw static line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = padding + (chartWidth / (data.length - 1)) * i;
        const normalizedValue = (data[i].value - minValue) / valueRange;
        const y = padding + chartHeight - (chartHeight * normalizedValue);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw dots
      ctx.fillStyle = '#3b82f6';
      for (let i = 0; i < data.length; i++) {
        const x = padding + (chartWidth / (data.length - 1)) * i;
        const normalizedValue = (data[i].value - minValue) / valueRange;
        const y = padding + chartHeight - (chartHeight * normalizedValue);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.textAlign = 'center';

    for (let i = 0; i < data.length; i++) {
      const x = padding + (chartWidth / (data.length - 1)) * i;
      const y = height - 10;
      ctx.fillText(data[i].label, x, y);
    }

  }, [data, height, showGrid, animate, isVisible]);

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
