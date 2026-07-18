import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maa Radio Mart | Mobile & Electronics Store in Gogamukh, Assam",

  description:
    "Maa Radio Mart is a trusted mobile and electronics store in Gogamukh, Assam. Explore genuine smartphones, laptops, mobile accessories, smart gadgets, audio products, and home appliances from leading brands at competitive prices with reliable customer service.",

  keywords: [
    "Maa Radio Mart",
    "Maa Radio Gogamukh",
    "Mobile Shop Gogamukh",
    "Electronics Store Gogamukh",
    "Best Mobile Shop Gogamukh",
    "Mobile Store Gogamukh",
    "Electronics Shop Gogamukh",
    "Mobile Shop Dhemaji",
    "Electronics Store Dhemaji",
    "Mobile Store Assam",
    "Electronics Store Assam",
    "Smartphones",
    "Laptops",
    "Mobile Accessories",
    "Smart Watches",
    "Bluetooth Speakers",
    "Home Appliances",
    "Vivo Mobile Gogamukh",
    "OPPO Mobile Gogamukh",
    "Samsung Mobile Gogamukh",
    "Realme Mobile Gogamukh",
    "Xiaomi Mobile Gogamukh",
    "iPhone Gogamukh",
  ],

  authors: [{ name: "Maa Radio Mart" }],

  verification: {
    google: "YlDXy8gNV3skF_95y0dRHPwFiFVLYrGrpAPOJcJPtgE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
