import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, DM_Sans } from "next/font/google";
//import { Analytics } from '@vercel/analytics/next'
import "../styles/globals.css";
import { StoreInitializer } from "@/components/providers/store-initializer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Using DM Sans as a similar display font to Cabinet Grotesk
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-cabinet",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learn Better - Aprende de tu propio material",
  description:
    "Plataforma de aprendizaje activo basada en tu contenido. Convierte PDFs, videos y audios en práctica situacional.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <StoreInitializer />
        {children}
        {
          //<Analytics />
        }
      </body>
    </html>
  );
}
