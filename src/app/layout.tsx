import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quản lý bán hàng",
  description: "Hệ thống quản lý kho và bán hàng",
};

const nav = [
  { href: "/", label: "Tổng quan" },
  { href: "/products", label: "Kho hàng" },
  { href: "/purchases", label: "Nhập hàng" },
  { href: "/stock-out", label: "Xuất hủy" },
  { href: "/orders", label: "Bán hàng" },
  { href: "/returns", label: "Trả hàng" },
  { href: "/customers", label: "Khách hàng" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold text-lg">Seller</Link>
            <nav className="flex gap-4 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-blue-600">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
