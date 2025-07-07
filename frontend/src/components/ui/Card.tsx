import React from "react";

export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white border border-emerald-100 shadow-xl rounded-2xl p-8 ${className}`}
    >
      {children}
    </div>
  );
} 