import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Истории памяти',
  description:
    'Страницы героев с биографией, наградами и хроникой фронтового пути.',
};

export default function FallenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
