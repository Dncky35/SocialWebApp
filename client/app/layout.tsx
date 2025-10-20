import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AppProviders } from "@/context/ContextProvider";

export const metadata: Metadata = {
  title: "Social Web App",
  description: "Connect, share, and explore — your modern social hub",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-950 via-cyan-950 to-violet-950 text-gray-100 min-h-screen relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-20"></div>

        {/* Main layout */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <AppProviders>
            <NavBar />
            <main className="flex-grow flex flex-col justify-center items-center pt-[3.5rem] pb-[3rem]">
              {children}
            </main>
            <Footer />
          </AppProviders>
        </div>
      </body>
    </html>
  );
}
