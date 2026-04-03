import { Syne, Outfit } from "next/font/google";
import "./globals.css";
import AuthHydrator from "@/components/auth/AuthHydrator";
import ProgressBarProvider from "@/components/layout/ProgressBarProvider";

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
          {children}
        </ProgressBarProvider>
      </body>
    </html>
  );
}

/**
 * Role: Root App Layout
 * What it has: 1 function
 * What it is doing: The `RootLayout` function wraps the entire application logic. It initializes custom Google Fonts (Syne and Outfit), injects global CSS, and encompasses the children within the global `ProgressBarProvider` and `AuthHydrator` context.
 * Where it is being used: Next.js automatically invokes this at the root level (`/`) to structure the main DOM and HTML skeleton.
 */
