import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import { MaterialsList } from '@/components/education/MaterialsList'

export const metadata: Metadata = {
  title: 'Методические материалы | Образовательный раздел',
  description:
    'Методические рекомендации и руководства для педагогов по организации патриотического воспитания. Советы психологов, планы интеграции в школьную программу.',
}

export default function MethodologyPage() {
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
          <div className="rounded-xl bg-red-600/10 p-3">
            <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Методические материалы
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Профессиональные руководства и рекомендации для педагогов по организации
          патриотического воспитания. Материалы разработаны с участием методистов и психологов,
          включают практические советы по работе с эмоционально сложными темами и интеграции в
          школьную программу.
        </p>
        <div className="h-1 w-20 rounded-full bg-ribbon-gradient sm:h-1.5 sm:w-24" />
      </div>

      {/* Materials List */}
      <MaterialsList category="methodology" />
    </div>
  )
}
