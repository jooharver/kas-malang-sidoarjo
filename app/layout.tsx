import type { Metadata } from "next";
import { Poppins } from "next/font/google"; //
import "./globals.css";

// Inisialisasi font Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins", 
});

export const metadata: Metadata = {
  title: "Kas Malang Sidoarjo",
  description: "Aplikasi iuran kas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* className={poppins.className} akan menyuntikkan font ke seluruh body */}
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  );
}