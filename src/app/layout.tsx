import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./(auth)/auth.css";

import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ConditionalLayout } from "@/components/layout/ConditionalLayout"


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anh Minh Tsc.",
  description: "Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
