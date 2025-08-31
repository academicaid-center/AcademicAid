import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import NotificationsInitializer from "@/components/NotificationsInitializer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AcademicAid أكاديميك أيد",
  description: "منصة تعليمية سورية شاملة",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icons/icon-192x192.png" },
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-dvh flex flex-col">
        <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <nav className="container py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary-700">AcademicAid</Link>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/sections" className="hover:text-primary-700">الأقسام</Link>
              <Link href="/interactive-classes" className="hover:text-primary-700">الصفوف التفاعلية</Link>
              <Link href="/notifications" className="hover:text-primary-700">الإشعارات</Link>
              <Link href="/profile" className="hover:text-primary-700">الملف الشخصي</Link>
            </div>
          </nav>
        </header>
        <main className="container flex-1 py-6">{children}</main>
        <Footer />
        <NotificationsInitializer />
      </body>
    </html>
  );
}
