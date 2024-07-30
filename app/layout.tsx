import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Provider from "./provider";

const fontSans = FontSans({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Live Docs",
  description: "Your live documentation collaborative site",
};

export default function RootLayout({ children } : { children: React.ReactNode }) {
  return (
  <ClerkProvider
    appearance={{
      baseTheme: dark,
      variables: { 
        colorPrimary: "#3371FF",
        fontSize: "16px",
      }
    }}
  >
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  </ClerkProvider>
  );
}
