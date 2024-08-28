import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "deResearcher",
  description: "A decentralized research platform on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-w-[350px] md:ml-[100px] md:mr-[100px] ml-[10px] mr-[10px]`}
      >
        <div className="flex flex-col gap-10">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
