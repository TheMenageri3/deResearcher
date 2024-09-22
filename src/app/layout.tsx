import type { Metadata } from "next";
import { Inter, Kalnia, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/components/Providers/UIProvider";

const inter = Inter({ subsets: ["latin"] });
const kalnia = Kalnia({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-kalnia",
});
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: {
    default: "deResearcher",
    template: "%s | deResearcher",
  },
  description: "A decentralized research platform on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kalnia.variable} ${atkinson.variable}`}>
      <body className={`${inter.className} min-w-[350px]`}>
        <UIProvider>{children}</UIProvider>
      </body>
    </html>
  );
}
