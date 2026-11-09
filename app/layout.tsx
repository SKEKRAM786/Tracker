import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'JobTracker — Personal Application & Referral Tracker',
  description: 'Track applications, full JD text, and referral follow-ups cleanly on mobile and desktop.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

