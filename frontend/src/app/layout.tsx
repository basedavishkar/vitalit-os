import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "VITALIt",
  description: "Hospital management system for local clinics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
