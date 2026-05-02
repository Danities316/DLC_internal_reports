import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Data Logs Center (DLC) Reporting System",
  description: "Internal Operational Portal for DLC Nigeria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
