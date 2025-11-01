import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Presentation } from 'lucide-react'
import { MaterialsList } from '@/components/education/MaterialsList'

export const metadata: Metadata = {
  title: 'Презентации о героях | Образовательный раздел',
  description:
    'Мультимедийные презентации о героях СВО для использования на уроках и мероприятиях. Готовые материалы с фотографиями, биографиями и историями подвига.',
}

export default function PresentationsPage() {
  return (
    <div className="container space-y-6 py-6 sm:space-y-8 sm:py-8 md:py-12">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/education">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к разделам
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-600/10 p-3">
            <Presentation className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Презентации о героях
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Готовые мультимедийные презентации для демонстрации на уроках, классных часах и
          торжественных мероприятиях. Материалы включают биографии героев, фотографии, истории
          подвига и методические комментарии.
        </p>
        <div className="h-1 w-20 rounded-full bg-ribbon-gradient sm:h-1.5 sm:w-24" />
      </div>

      {/* Materials List */}
      <MaterialsList category="presentations" />
    </div>
  )
}
