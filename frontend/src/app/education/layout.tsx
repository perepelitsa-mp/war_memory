import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Образовательный раздел | Книга Памяти Кавалерово',
  description:
    'Методические материалы для педагогов и школьников. Уроки мужества, презентации о героях, викторины, проекты и методические рекомендации для патриотического воспитания.',
}

export default function EducationLayout({ children }: { children: React.ReactNode }) {
  return children
}
