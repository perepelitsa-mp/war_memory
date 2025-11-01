import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const SimpleMapTest = dynamic(() => import('@/components/map/SimpleMapTest'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
})

export default function TestMapPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Тест Яндекс.Карт</h1>
      <SimpleMapTest />
    </div>
  )
}
