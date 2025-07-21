import type { Metadata } from "next";
import "./globals.css";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"], 
});


export const metadata: Metadata = {
  title: "Flowboard",
  description: "A collaborative whiteboard application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${caveat.variable} antialiased vsc-initialized`}
      >
        {children}
      </body>
    </html>
  );
}
