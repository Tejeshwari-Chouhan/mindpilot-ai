import type { Metadata } from "next";
import "./globals.css";
import ClientShell from "@/components/shared/ClientShell";
import { PomodoroProvider } from "@/hooks/usePomodoro";

export const metadata: Metadata = {
  title: "MindPilot AI - Your Personal Mental Resilience Co-Pilot",
  description: "A premium AI mental health companion specifically tailored for competitive exam aspirants (JEE, NEET, UPSC, CAT, GATE, CUET). Discover stress triggers, monitor burnout risk, and take control of your study journey.",
  keywords: "JEE preparation, NEET stress, UPSC burnout, GATE, CAT exam anxiety, mental health companion, exam stress tracker",
  authors: [{ name: "MindPilot AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <PomodoroProvider>
          <ClientShell>{children}</ClientShell>
        </PomodoroProvider>
      </body>
    </html>
  );
}
