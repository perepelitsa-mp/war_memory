import type { Metadata } from 'next';
import { Inter, PT_Serif } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RootProviders } from '@/components/providers/RootProviders';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const ptSerif = PT_Serif({
  weight: ['400', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-pt-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Память героев — цифровой мемориал',
  description:
    'Интерактивный мемориал в честь павших защитников: архивы, хроники, карта памяти и живые истории потомков.',
  keywords: [
    'память героев',
    'цифровой мемориал',
    'вечный огонь',
    'книга памяти',
    'истории фронтовиков',
  ],
  authors: [{ name: 'Память героев — цифровой мемориал' }],
  openGraph: {
    title: 'Память героев — цифровой мемориал',
    description:
      'Интерактивный мемориал в честь павших защитников: архивы, хроники, карта памяти и живые истории потомков.',
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Память героев — цифровой мемориал',
    description:
      'Интерактивный мемориал в честь павших защитников: архивы, хроники, карта памяти и живые истории потомков.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

const themeInitScript = `
(() => {
  const STORAGE_KEY = 'war-memory:theme';
  const DAY_CLASS = 'theme-day';
  const NIGHT_CLASS = 'theme-night';
  try {
    const root = document.documentElement;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored === 'day' || stored === 'night' ? stored : (prefersDark ? 'night' : 'day');
    const addClass = theme === 'day' ? DAY_CLASS : NIGHT_CLASS;
    const removeClass = theme === 'day' ? NIGHT_CLASS : DAY_CLASS;
    if (!root.classList.contains(addClass)) {
      root.classList.add(addClass);
    }
    root.classList.remove(removeClass);
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'day' ? 'light' : 'dark';
  } catch (error) {
    // ignore
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${ptSerif.variable} theme-day`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="relative min-h-screen overflow-x-hidden bg-background font-sans antialiased">
        <RootProviders>
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </RootProviders>
      </body>
    </html>
  );
}
