import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jess & Liam | Wedding RSVP",
  description: "Wedding RSVP for Jess and Liam.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
