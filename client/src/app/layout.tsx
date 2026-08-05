import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Header from "@/components/header";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import Container from "@/components/Container";
import "./globals.css";

export const metadata: Metadata = {
  title: "Find Place",
  description: "Find your next place to live",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased font-[family-name:var(--font-geist-sans)]`}
      >
        <GoogleMapsProvider>
          <Header />
          <main>
            <Container>{children}</Container>
          </main>
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
