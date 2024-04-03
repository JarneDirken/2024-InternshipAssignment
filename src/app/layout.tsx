import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import RecoilContextProvider from "./recoilContextProvider";

const inter = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Internship Assignment",
  description: "Created by two students from thomasmore in Beglium",
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
          </main>
        </body>
      </html>
  );
}