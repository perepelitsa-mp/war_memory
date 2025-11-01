'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Award,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react'

interface StatisticsData {
  overview: {
    totalHeroes: number
    totalRegions: number
    avgAge: number
  }
  byRegion: Array<{ name: string; count: number }>
  byServiceType: Array<{ name: string; value: number }>
  byAge: Array<{ range: string; count: number }>
  byMonth: Array<{ month: string; count: number }>
  youngest: Array<{ id: string; age: number; name: string; photoUrl?: string }>
  oldest: Array<{ id: string; age: number; name: string; photoUrl?: string }>
  mostDecorated: Array<{ id: string; count: number; name: string; photoUrl?: string }>
}

const COLORS = ['#FF7F00', '#F4B95A', '#D4AF37', '#CD853F', '#B8860B', '#DAA520']

export default function StatsPage() {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/statistics')
      if (!response.ok) throw new Error('Failed to fetch statistics')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mb-8 space-y-2 text-center">
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container py-8 md:py-12">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Ошибка загрузки статистики: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container space-y-6 py-6 sm:space-y-8 sm:py-8 md:space-y-10 md:py-12">
      {/* Header */}
      <div className="space-y-3 text-center sm:space-y-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Статистика и аналитика
        </h1>
        <p className="mx-auto max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
          Аналитические данные о героях, павших в ходе СВО. Статистика помогает увидеть полную
          картину подвига наших защитников.
        </p>
        <div className="mx-auto h-1 w-20 rounded-full bg-ribbon-gradient sm:h-1.5 sm:w-24" />
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-xl bg-primary/15 p-2.5 sm:p-3">
                <Users className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                  Всего героев
                </p>
                <p className="text-2xl font-bold text-primary sm:text-3xl">
                  {data.overview.totalHeroes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-xl bg-primary/15 p-2.5 sm:p-3">
                <MapPin className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                  Регионов
                </p>
                <p className="text-2xl font-bold text-primary sm:text-3xl">
                  {data.overview.totalRegions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-xl bg-primary/15 p-2.5 sm:p-3">
                <Calendar className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                  Средний возраст
                </p>
                <p className="text-2xl font-bold text-primary sm:text-3xl">
                  {data.overview.avgAge} лет
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Region */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              Топ-10 городов
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byRegion}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Bar dataKey="count" fill="#FF7F00" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Service Type */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChartIcon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              По виду службы
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.byServiceType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.byServiceType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Age */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              По возрасту
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byAge}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Bar dataKey="count" fill="#F4B95A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Month */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              Динамика гибели по месяцам
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.byMonth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF7F00"
                  strokeWidth={2}
                  dot={{ fill: '#FF7F00' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Heroes Lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Youngest */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Самые молодые герои</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
            {data.youngest.map((hero, index) => (
              <Link
                key={hero.id}
                href={`/fallen/${hero.id}`}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background-soft/70 p-3 transition hover:border-primary/40 hover:bg-background-soft"
              >
                <Badge variant="secondary" className="h-6 w-6 items-center justify-center rounded-full p-0">
                  {index + 1}
                </Badge>
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={hero.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {hero.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{hero.name}</p>
                  <p className="text-xs text-muted-foreground">{hero.age} лет</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Oldest */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Старшие герои</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
            {data.oldest.map((hero, index) => (
              <Link
                key={hero.id}
                href={`/fallen/${hero.id}`}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background-soft/70 p-3 transition hover:border-primary/40 hover:bg-background-soft"
              >
                <Badge variant="secondary" className="h-6 w-6 items-center justify-center rounded-full p-0">
                  {index + 1}
                </Badge>
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={hero.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {hero.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{hero.name}</p>
                  <p className="text-xs text-muted-foreground">{hero.age} лет</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Most Decorated */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              Самые награждённые
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
            {data.mostDecorated.map((hero, index) => (
              <Link
                key={hero.id}
                href={`/fallen/${hero.id}`}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background-soft/70 p-3 transition hover:border-primary/40 hover:bg-background-soft"
              >
                <Badge variant="secondary" className="h-6 w-6 items-center justify-center rounded-full p-0">
                  {index + 1}
                </Badge>
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={hero.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {hero.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{hero.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {hero.count} {hero.count === 1 ? 'награда' : hero.count < 5 ? 'награды' : 'наград'}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
