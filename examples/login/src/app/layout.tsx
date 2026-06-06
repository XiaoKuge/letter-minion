import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "letter-minion · Login 示例",
  description: "qed-site-style login gate powered by letter-minion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
