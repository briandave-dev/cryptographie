import type { Metadata } from "next";
import "./globals.css";
import { fontSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Voting App",
  description: "Application for secure voting using cryptographic algorithms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased ${fontSans.variable}`}>
        {children}

      </body>
    </html>
  );
}
