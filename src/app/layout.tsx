import type { Metadata } from "next";
import { Cairo, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";

function safeMetadataBase() {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL("http://localhost:3002");
  }
}

export const metadata: Metadata = {
  metadataBase: safeMetadataBase(),
  title: {
    default: "مطعم وشواية البركة الكبرى | Le Grand Baraka Grill",
    template: "%s | البركة الكبرى",
  },
  description:
    "مذاق مغربي أصيل، مشاوي فالفحم، وتوصيل حتى للدار — منيو أونلاين وطلب سريع بالدار البيضاء.",
  openGraph: {
    title: "مطعم وشواية البركة الكبرى",
    description:
      "أكلات مغربية شعبية، مشاوي على الفحم، وطواجن يومية مع خدمة التوصيل.",
    locale: "ar_MA",
    type: "website",
    url: safeMetadataBase().toString(),
    siteName: "Le Grand Baraka Grill",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} ${playfair.variable} min-h-dvh bg-[#0b0b0b] font-sans text-[#faf7ef] antialiased`}
        suppressHydrationWarning
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
