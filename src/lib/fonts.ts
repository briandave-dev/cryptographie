import {
    JetBrains_Mono as FontMono,
    Plus_Jakarta_Sans as FontSans,
} from "next/font/google"

import { Inter } from 'next/font/google';

// Inter font configuration
export const interFont = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

// Make sure to specify subsets and display strategy
export const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",  // Add display strategy
    preload: true     // Ensure font is preloaded
})

export const fontMono = FontMono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap"   // Add display strategy
})
