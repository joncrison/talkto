import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talkto - Contact Your Representatives",
  description:
    "Find and contact your government representatives. Enter your zip code to see your Senators, House Rep, and Governor with easy one-tap calling and emailing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
