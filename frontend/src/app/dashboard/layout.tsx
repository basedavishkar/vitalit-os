'use client';

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(280);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Fixed Sidebar */}
      <Sidebar onWidthChange={setSidebarWidth} />
      
      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-h-screen overflow-hidden"
        style={{ 
          marginLeft: `${sidebarWidth}px`,
          transition: 'margin-left 0.5s ease-out',
          width: `calc(100vw - ${sidebarWidth}px)`
        }}
      >
        {/* Fixed Header */}
        <Header />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
