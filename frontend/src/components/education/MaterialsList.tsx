'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Download,
  ExternalLink,
  Search,
  Filter,
  BookOpen,
  Presentation,
  Brain,
  Users,
  FileText,
} from 'lucide-react'
import type { EducationalMaterial } from '@/app/api/education/route'

interface MaterialsListProps {
  category: 'lessons' | 'presentations' | 'quizzes' | 'projects' | 'methodology'
}

const categoryConfig = {
  lessons: {
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-600/10',
  },
  presentations: {
    icon: Presentation,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-600/10',
  },
  quizzes: {
    icon: Brain,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-600/10',
  },
  projects: {
    icon: Users,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-600/10',
  },
  methodology: {
    icon: FileText,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-600/10',
  },
} as const

export function MaterialsList({ category }: MaterialsListProps) {
  const config = categoryConfig[category]
  const Icon = config.icon
  const { color, bgColor } = config
  const [materials, setMaterials] = useState<EducationalMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [ageFilter, setAgeFilter] = useState<string>('all')

  useEffect(() => {
    fetchMaterials()
  }, [category])

  const fetchMaterials = async () => {
    try {
      const response = await fetch(`/api/education?category=${category}`)
      const data = await response.json()
      setMaterials(data.materials || [])
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.topics.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesAge = ageFilter === 'all' || material.ageGroup.includes(ageFilter)

    return matchesSearch && matchesAge
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск материалов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Возрастная группа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все возрасты</SelectItem>
                <SelectItem value="1-4 класс">1-4 класс</SelectItem>
                <SelectItem value="5-9 класс">5-9 класс</SelectItem>
                <SelectItem value="7-11 класс">7-11 класс</SelectItem>
                <SelectItem value="8-11 класс">8-11 класс</SelectItem>
                <SelectItem value="9-11 класс">9-11 класс</SelectItem>
                <SelectItem value="педагогов">Для педагогов</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Найдено материалов: {filteredMaterials.length}
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Материалы не найдены. Попробуйте изменить параметры поиска.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMaterials.map((material) => (
            <Card
              key={material.id}
              className="group transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-xl ${bgColor} p-3`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-lg sm:text-xl">{material.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {material.ageGroup}
                          </Badge>
                          {material.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {material.duration}
                            </Badge>
                          )}
                          {material.fileType && (
                            <Badge variant="secondary" className="text-xs">
                              {material.fileType.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {material.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1.5">
                      {material.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    {material.fileType === 'online' ? (
                      <Button size="sm" className="w-full sm:w-auto">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Открыть
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Скачать
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
