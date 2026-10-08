import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Toaster } from "react-hot-toast";

import "./globals.css";
import "../styles/portfolio.css";
import { cn } from "@/lib/utils";
import AppConvexProvider from "@/components/providers/ConvexProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Asia Ashraf | Full-Stack Next.js Developer",
  description:
    "Portfolio of Asia Ashraf: Next.js, React and TypeScript projects, services and contact.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${poppins.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <MotionConfig reducedMotion="user">
            <AppConvexProvider>
              {children}
              <Toaster position="top-right" />
            </AppConvexProvider>
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}