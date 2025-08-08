import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/components/providers/theme-provider"

export const metadata: Metadata = {
  title: "VITALIt - Premium Healthcare Management System",
  description: "Modern, Apple-inspired healthcare management system for hospitals and clinics",
  keywords: "healthcare, hospital management, medical software, patient care",
  authors: [{ name: "VITALIt Team" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#34C759",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgb(var(--card))',
                color: 'rgb(var(--foreground))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
