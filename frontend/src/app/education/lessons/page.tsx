import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { MaterialsList } from '@/components/education/MaterialsList'

export const metadata: Metadata = {
  title: 'Уроки мужества | Образовательный раздел',
  description:
    'Готовые материалы для проведения уроков мужества и классных часов о героях СВО. Презентации, методические рекомендации и рабочие листы для учителей.',
}

export default function LessonsPage() {
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
          <div className="rounded-xl bg-blue-600/10 p-3">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Уроки мужества
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Готовые материалы для проведения уроков памяти, классных часов и внеурочных занятий о
          героях специальной военной операции. Каждый урок включает презентацию, методические
          рекомендации и дополнительные материалы.
        </p>
        <div className="h-1 w-20 rounded-full bg-ribbon-gradient sm:h-1.5 sm:w-24" />
      </div>

      {/* Materials List */}
      <MaterialsList category="lessons" />
    </div>
  )
}
