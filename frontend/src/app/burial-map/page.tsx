import { Metadata } from 'next'
import { BurialMap } from '@/components/map/BurialMap'

export const metadata: Metadata = {
  title: 'Карта захоронений | Книга Памяти Кавалерово',
  description: 'Интерактивная карта мест захоронения героев СВО из Кавалерово',
}

export default function BurialMapPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
      {/* Заголовок страницы */}
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">Карта захоронений</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Места упокоения героев, павших в ходе СВО. Найдите место захоронения на карте и узнайте,
          как добраться.
        </p>
      </div>

      {/* Карта */}
      <BurialMap />

      {/* Информационный блок */}
      <div className="mt-6 rounded-lg border border-amber-200/50 bg-background/60 p-4">
        <h2 className="mb-2 text-lg font-semibold">Как использовать карту</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Нажмите на маркер, чтобы увидеть информацию о герое</li>
          <li>• Кликните "Открыть карточку" для просмотра полной информации</li>
          <li>• Используйте кнопку "Маршрут" на карте для построения пути до места захоронения</li>
          <li>• Карта работает на основе Яндекс.Карт с актуальными данными по России и новым территориям</li>
        </ul>
      </div>
    </div>
  )
}
