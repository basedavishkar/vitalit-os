"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Series = {
  key: string;
  color?: string;
  name?: string;
};

interface LineChartCardProps {
  title: string;
  description?: string;
  data: Array<Record<string, number | string>>;
  series: Series[];
  height?: number;
}

export function LineChartCard({ title, description, data, series, height = 280 }: LineChartCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground/80">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "rgba(var(--card), 1)",
                    border: "1px solid rgb(var(--border))",
                    borderRadius: 12,
                  }}
                />
                {series.map((s, i) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name || s.key}
                    stroke={s.color || "#0A84FF"}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    animationDuration={300 + i * 100}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
