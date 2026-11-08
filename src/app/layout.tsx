import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trackr",
  description: "Person-based multi-channel transaction tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600">Trackr</h1>
            <a href="/settings" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              Settings
            </a>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-4xl mx-auto p-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}