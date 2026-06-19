import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/app/providers";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "DSA Mentor AI",
    template: "%s | DSA Mentor AI"
  },
  description: "AI-powered DSA roadmap, coding practice, code review, contests, and progress analytics.",
  applicationName: "DSA Mentor AI",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
