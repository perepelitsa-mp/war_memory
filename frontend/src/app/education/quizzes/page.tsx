import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brain } from 'lucide-react'
import { MaterialsList } from '@/components/education/MaterialsList'

export const metadata: Metadata = {
  title: 'Викторины и тесты | Образовательный раздел',
  description:
    'Интерактивные викторины и тесты для проверки знаний о героях СВО, наградной системе России и истории. Подходят для проведения на уроках и внеклассных мероприятиях.',
}

export default function QuizzesPage() {
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
          <div className="rounded-xl bg-green-600/10 p-3">
            <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Викторины и тесты
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Интерактивные задания для проверки и закрепления знаний о героях специальной военной
          операции, наградной системе России и современной истории. Материалы можно использовать
          как на уроках, так и для самостоятельного изучения.
        </p>
        <div className="h-1 w-20 rounded-full bg-ribbon-gradient sm:h-1.5 sm:w-24" />
      </div>

      {/* Materials List */}
      <MaterialsList category="quizzes" />
    </div>
  )
}
