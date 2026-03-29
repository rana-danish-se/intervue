import { Syne, Outfit } from "next/font/google";
import "./globals.css";

// Headings: bold, expressive, distinctly editorial
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Body / UI: clean geometric, great for SaaS forms and labels
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
