import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";

export const metadata: Metadata = {
 title: "VoteCrypto - Système de Vote Électronique Sécurisé",
 description: "Plateforme de vote électronique démonstrative utilisant le chiffrement asymétrique RSA pour garantir la confidentialité, l'intégrité et l'authenticité des votes",
};

const font = Space_Grotesk({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased ${font.className}`}>
        {children}

      </body>
    </html>
  );
}
