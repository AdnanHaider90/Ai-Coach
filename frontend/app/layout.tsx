import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Coach",
  description: "Life, Career, and Finance coaching powered by AI"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
