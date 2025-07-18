import type { Metadata } from "next";
import { Source_Sans_3, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const ubuntuMono = Ubuntu_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "700"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Prepnosis | NEET-PG & INICET Mock Tests",
  description:
    "India's most elegant NEET-PG and INICET mock test platform — built with Next.js 15, Supabase, React Query, and designed for top-rankers. 🚀",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </head>
      <body
        className={`${sourceSans.variable} ${ubuntuMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster position="top-center" duration={3000} />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
