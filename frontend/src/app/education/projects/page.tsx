import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'
import { MaterialsList } from '@/components/education/MaterialsList'

export const metadata: Metadata = {
  title: 'Проекты для школьников | Образовательный раздел',
  description:
    'Идеи исследовательских и творческих проектов о героях СВО для школьников. Готовые методики, планы работы и критерии оценки для проектной деятельности.',
}

export default function ProjectsPage() {
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
          <div className="rounded-xl bg-orange-600/10 p-3">
            <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Проекты для школьников
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Методические материалы для организации исследовательских и творческих проектов о героях
          специальной военной операции. Включают планы работы, шаблоны оформления и критерии
          оценки. Идеально подходят для внеурочной деятельности и конкурсов.
        </p>
        <div className="h-1 w-20 rounded-full bg-ribbon-gradient sm:h-1.5 sm:w-24" />
      </div>

      {/* Materials List */}
      <MaterialsList category="projects" />
    </div>
  )
}
