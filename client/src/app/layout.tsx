import { FileProvider } from "@/contexts/fileContext";
import { SessionProvider } from "@/contexts/sessionContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeFitter",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <FileProvider>
            {children}
          </FileProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
