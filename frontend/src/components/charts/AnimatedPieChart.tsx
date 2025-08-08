'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PieData {
  label: string;
  value: number;
  color: string;
}

interface AnimatedPieChartProps {
  title: string;
  description?: string;
  data: PieData[];
  height?: number;
  animate?: boolean;
}

export function AnimatedPieChart({ 
  title, 
  description, 
  data, 
  height = 300,
  animate = true 
}: AnimatedPieChartProps) {
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

    const centerX = canvas.offsetWidth / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 60;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (animate) {
      let progress = 0;
      const animatePie = () => {
        if (progress >= 1) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let currentAngle = -Math.PI / 2; // Start from top

        data.forEach((item, index) => {
          const sliceAngle = (2 * Math.PI * item.value / total) * progress;
          
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
          ctx.closePath();
          
          ctx.fillStyle = item.color;
          ctx.fill();

          // Add stroke for separation
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          currentAngle += sliceAngle;
        });

        progress += 0.02;
        if (progress < 1) {
          requestAnimationFrame(animatePie);
        } else {
          // Draw legend
          drawLegend(ctx, centerX, centerY, radius);
        }
      };

      setTimeout(() => {
        requestAnimationFrame(animatePie);
      }, 300);
    } else {
      // Draw static pie chart
      let currentAngle = -Math.PI / 2;

      data.forEach((item) => {
        const sliceAngle = 2 * Math.PI * item.value / total;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = item.color;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        currentAngle += sliceAngle;
      });

      drawLegend(ctx, centerX, centerY, radius);
    }

  }, [data, height, animate, isVisible]);

  const drawLegend = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    const legendX = centerX + radius + 40;
    const legendY = centerY - radius / 2;
    const legendSpacing = 25;

    ctx.font = '12px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.textAlign = 'left';

    data.forEach((item, index) => {
      const y = legendY + index * legendSpacing;
      
      // Draw legend color box
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, y - 8, 16, 16);
      
      // Draw legend text
      ctx.fillStyle = '#374151';
      ctx.fillText(`${item.label}: ${item.value}`, legendX + 24, y + 4);
    });
  };

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
