'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BookOpen,
  Presentation,
  Brain,
  Users,
  FileText,
  Download,
  GraduationCap,
  Award,
  ArrowRight,
  School,
} from 'lucide-react'
import type { EducationalMaterial } from '@/app/api/education/route'

const categoryConfig = {
  lessons: {
    title: 'Уроки мужества',
    description: 'Готовые материалы для проведения уроков памяти',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-600/10',
    href: '/education/lessons',
  },
  presentations: {
    title: 'Презентации о героях',
    description: 'Мультимедийные материалы для демонстрации',
    icon: Presentation,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-600/10',
    href: '/education/presentations',
  },
  quizzes: {
    title: 'Викторины и тесты',
    description: 'Интерактивные задания для проверки знаний',
    icon: Brain,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-600/10',
    href: '/education/quizzes',
  },
  projects: {
    title: 'Проекты для школьников',
    description: 'Идеи исследовательских и творческих проектов',
    icon: Users,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-600/10',
    href: '/education/projects',
  },
  methodology: {
    title: 'Методические материалы',
    description: 'Руководства и рекомендации для педагогов',
    icon: FileText,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-600/10',
    href: '/education/methodology',
  },
} as const

export default function EducationPage() {
  const [materials, setMaterials] = useState<EducationalMaterial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/education')
      const data = await response.json()
      setMaterials(data.materials || [])
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMaterialsByCategory = (category: string) => {
    return materials.filter((m) => m.category === category)
  }

  if (loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mb-8 space-y-2 text-center">
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container space-y-8 py-6 sm:space-y-10 sm:py-8 md:py-12">
      {/* Hero Section */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ribbon-orange via-primary/90 to-ribbon-black shadow-lg sm:h-20 sm:w-20">
          <GraduationCap className="h-8 w-8 text-white sm:h-10 sm:w-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Образовательный раздел
        </h1>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
          Методические материалы для педагогов, школьников и студентов. Готовые уроки,
          презентации, викторины и проекты для патриотического воспитания на примере подвига
          героев специальной военной операции.
        </p>
        <div className="mx-auto h-1 w-20 rounded-full bg-ribbon-gradient sm:h-1.5 sm:w-24" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 text-center">
            <School className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-2xl font-bold text-primary">{materials.length}</p>
            <p className="text-xs text-muted-foreground">материалов</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-2xl font-bold text-primary">{getMaterialsByCategory('lessons').length}</p>
            <p className="text-xs text-muted-foreground">уроков</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 text-center">
            <Brain className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-2xl font-bold text-primary">{getMaterialsByCategory('quizzes').length}</p>
            <p className="text-xs text-muted-foreground">викторин</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-2xl font-bold text-primary">{getMaterialsByCategory('projects').length}</p>
            <p className="text-xs text-muted-foreground">проектов</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold sm:text-2xl">Разделы</h2>
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon
            const count = getMaterialsByCategory(key).length

            return (
              <Card
                key={key}
                className="group transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`rounded-xl ${config.bgColor} p-3`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count} {count === 1 ? 'материал' : count < 5 ? 'материала' : 'материалов'}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 text-lg sm:text-xl">{config.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {config.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="group w-full justify-between"
                    asChild
                  >
                    <Link href={config.href}>
                      Перейти к материалам
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Latest Materials */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold sm:text-2xl">Последние добавленные</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)
            .map((material) => {
              const config = categoryConfig[material.category]
              const Icon = config.icon

              return (
                <Card
                  key={material.id}
                  className="group transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex items-center gap-2">
                      <div className={`rounded-lg ${config.bgColor} p-2`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {material.ageGroup}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-base">
                      {material.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {material.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mb-3 flex flex-wrap gap-1">
                      {material.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    {material.fileType === 'online' ? (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={config.href}>
                          Открыть
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-3 w-3" />
                        Скачать {material.fileType?.toUpperCase()}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* CTA */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6 text-center sm:p-8">
          <Award className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="mb-2 text-lg font-bold sm:text-xl">
            Есть идеи для образовательных материалов?
          </h3>
          <p className="mb-4 text-sm text-muted-foreground sm:text-base">
            Мы открыты к сотрудничеству с педагогами, методистами и образовательными
            учреждениями. Поделитесь своими наработками и помогите сохранить память о героях.
          </p>
          <Button size="lg" className="shadow-glow" asChild>
            <Link href="/contact">Связаться с нами</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
