import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";
import BackgroundSlide from "./components/BackgroundSlide";

export const metadata: Metadata = {
  title: "MasterMec | Gestão de Manutenção",
  description: "Sistema de gestão de máquinas e manutenção",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <BackgroundSlide />

        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}