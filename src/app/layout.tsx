import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import RecoilContextProvider from "./recoilContextProvider";
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-borrowing",
  description: "Want to borrow items? Your at the right address.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body className={inter.className}>
          <main>
              <RecoilContextProvider>
                {children}
              </RecoilContextProvider>
              <SpeedInsights />
          </main>
        </body>
      </html>
  );
}