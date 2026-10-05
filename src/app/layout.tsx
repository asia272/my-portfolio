import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
// import { Shell } from "@/components/effects";
import { Shell } from "@/components/Shell";
import "./globals.css";
import "../styles/portfolio.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Asia Ashraf | Full-Stack Next.js Developer",
  description: "Portfolio of Asia Ashraf: Next.js, React and TypeScript projects, services and contact.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Shell>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
