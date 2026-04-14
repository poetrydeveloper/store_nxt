import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Система учёта товаров",
  description: "Система для учёта движения товаров, кассы и финансов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
