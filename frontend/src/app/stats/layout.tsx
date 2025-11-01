import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Статистика | Книга Памяти Кавалерово',
  description: 'Аналитические данные о героях, павших в ходе СВО. Статистика по регионам, возрасту, наградам и другие данные.',
}

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children
}
