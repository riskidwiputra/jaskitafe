import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600"] });
const body = Manrope({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "JasKita Medan Johor | Sewa Jas untuk Momen Spesial",
  description:
    "Temukan jas untuk momen spesial bersama JasKita Medan Johor. Lihat galeri Instagram, lokasi toko, dan hubungi kami melalui WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
