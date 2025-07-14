import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import { AuthProvider } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950 transition-colors">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-8 overflow-y-auto flex flex-col gap-8">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
