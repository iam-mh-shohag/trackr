import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { GoGear } from "react-icons/go";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trackr",
  description: "Person-based multi-channel transaction tracker",
  manifest: "/manifest.webmanifest", // Add this
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trackr",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}
      >
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <Link href={'/'} className="flex items-center gap-2 text-[#094187] font-bold text-3xl">
            <Image
              src="/logo.png"
              width={70}
              height={70}
              alt="Picture of the author"
            />
            <p>Track<span className="text-[#08C47E]">r</span></p>
            </Link>
            <a
              href="/settings"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <GoGear className="text-[#08C47E] text-3xl hover:rotate-90" />
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto p-4 py-8">{children}</main>
      </body>
    </html>
  );
}
