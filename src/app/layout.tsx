import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarkVault — Smart Bookmark Manager",
  description: "Organize, discover, and manage your bookmarks with intelligence. Real-time sync, folders, tags, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Creative favicon for Smart Bookmark App */}
        <link rel="icon" href="/bookmark-favicon.svg" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/bookmark-favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="application-name" content="Smart Bookmark App" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
