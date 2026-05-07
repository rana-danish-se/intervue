/*
Role: Root Next.js application layout.
What it does: Applies global fonts/styles and mounts cross-app providers (auth hydration, progress bar, toast) around all routes.
Where used: Automatically wrapped around every page in the App Router.
Why it exists: Centralizes app-wide UI/runtime scaffolding in one stable entrypoint.
*/

import { Syne, Outfit } from "next/font/google";
import "./globals.css";
import AuthHydrator from "@/components/auth/AuthHydrator";
import ProgressBarProvider from "@/components/layout/ProgressBarProvider";
import Toast from "@/components/ui/Toast";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Intervue",
  description: "Premium SaaS Platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProgressBarProvider>
          <AuthHydrator />
          <Toast />
          {children}
        </ProgressBarProvider>
      </body>
    </html>
  );
}
