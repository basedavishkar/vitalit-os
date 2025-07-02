import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VITALIt-OS",
  description: "Hospital management system for local clinics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
