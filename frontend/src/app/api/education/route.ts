import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export interface EducationalMaterial {
  id: string
  title: string
  description: string
  category: 'lessons' | 'presentations' | 'quizzes' | 'projects' | 'methodology'
  ageGroup: string
  duration?: string
  downloadUrl?: string
  fileType?: 'pdf' | 'pptx' | 'docx' | 'online'
  topics: string[]
  createdAt: string
  updatedAt: string
}

// Mock данные - в будущем заменить на запросы к БД
const mockMaterials: EducationalMaterial[] = [
  // Уроки мужества
  {
    id: 'lesson-1',
    title: 'Урок мужества: Герои специальной военной операции',
    description: 'Комплексный урок для 5-9 классов о подвиге российских военнослужащих. Включает презентацию, методические рекомендации и рабочие листы для учащихся.',
    category: 'lessons',
    ageGroup: '5-9 класс',
    duration: '45 минут',
    downloadUrl: '/materials/lessons/uroki-muzhestva-svo.pdf',
    fileType: 'pdf',
    topics: ['Патриотизм', 'СВО', 'Мужество'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'lesson-2',
    title: 'Урок памяти: Кавалеровский район в истории СВО',
    description: 'Региональный материал о героях Кавалеровского района. Подходит для классных часов и уроков краеведения.',
    category: 'lessons',
    ageGroup: '7-11 класс',
    duration: '40 минут',
    downloadUrl: '/materials/lessons/kavalerovsiy-raion-svo.pdf',
    fileType: 'pdf',
    topics: ['Краеведение', 'История', 'Память'],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
  {
    id: 'lesson-3',
    title: 'Урок для начальной школы: Что такое героизм?',
    description: 'Адаптированный материал для младших школьников о понятиях мужества, долга и героизма на доступных примерах.',
    category: 'lessons',
    ageGroup: '1-4 класс',
    duration: '35 минут',
    downloadUrl: '/materials/lessons/geroizm-nachalnaya-shkola.pdf',
    fileType: 'pdf',
    topics: ['Героизм', 'Нравственность', 'Долг'],
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10',
  },

  // Презентации
  {
    id: 'presentation-1',
    title: 'Герои нашего времени: истории подвига',
    description: 'Мультимедийная презентация с биографиями героев СВО, фотографиями и видеоматериалами. Готова к использованию на уроке.',
    category: 'presentations',
    ageGroup: '8-11 класс',
    duration: '20-30 минут',
    downloadUrl: '/materials/presentations/geroi-nashego-vremeni.pptx',
    fileType: 'pptx',
    topics: ['Биографии', 'Подвиг', 'СВО'],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: 'presentation-2',
    title: 'Памятники и мемориалы героям СВО',
    description: 'Виртуальная экскурсия по мемориалам и памятникам, посвященным героям специальной военной операции.',
    category: 'presentations',
    ageGroup: '5-11 класс',
    duration: '25 минут',
    downloadUrl: '/materials/presentations/pamyatniki-geroyam.pptx',
    fileType: 'pptx',
    topics: ['Память', 'Культура', 'История'],
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
  },

  // Викторины
  {
    id: 'quiz-1',
    title: 'Викторина: Знаешь ли ты героев СВО?',
    description: 'Интерактивная викторина с 20 вопросами о героях специальной военной операции, их подвигах и наградах.',
    category: 'quizzes',
    ageGroup: '7-11 класс',
    duration: '15-20 минут',
    fileType: 'online',
    topics: ['Знания', 'История', 'Герои'],
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25',
  },
  {
    id: 'quiz-2',
    title: 'Тест: Государственные награды России',
    description: 'Образовательный тест о наградной системе РФ, орденах и медалях, которыми награждают героев.',
    category: 'quizzes',
    ageGroup: '8-11 класс',
    duration: '10-15 минут',
    fileType: 'online',
    topics: ['Награды', 'Геральдика', 'Государство'],
    createdAt: '2024-02-20',
    updatedAt: '2024-02-20',
  },

  // Проекты
  {
    id: 'project-1',
    title: 'Герой моего города: исследовательский проект',
    description: 'Методические рекомендации для проведения школьного исследовательского проекта о героях родного города. Включает план работы, шаблоны и критерии оценки.',
    category: 'projects',
    ageGroup: '7-11 класс',
    duration: '1-2 месяца',
    downloadUrl: '/materials/projects/geroi-moego-goroda.pdf',
    fileType: 'pdf',
    topics: ['Исследование', 'Краеведение', 'Проектная работа'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
  {
    id: 'project-2',
    title: 'Книга памяти нашей школы',
    description: 'Руководство по созданию школьной книги памяти о выпускниках-героях СВО. Включает технические требования и примеры оформления.',
    category: 'projects',
    ageGroup: '8-11 класс',
    duration: '2-3 месяца',
    downloadUrl: '/materials/projects/kniga-pamyati-shkoly.pdf',
    fileType: 'pdf',
    topics: ['Память', 'Творчество', 'Коллективная работа'],
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05',
  },
  {
    id: 'project-3',
    title: 'Виртуальный музей героев',
    description: 'Пошаговая инструкция для создания виртуального музея о героях СВО силами школьников. Включает шаблоны и технические решения.',
    category: 'projects',
    ageGroup: '9-11 класс',
    duration: '3-4 месяца',
    downloadUrl: '/materials/projects/virtualnyj-muzej.pdf',
    fileType: 'pdf',
    topics: ['IT', 'Музейное дело', 'Память'],
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
  },

  // Методические материалы
  {
    id: 'methodology-1',
    title: 'Методические рекомендации по патриотическому воспитанию',
    description: 'Комплексное руководство для педагогов по организации патриотической работы в образовательном учреждении с использованием материалов о героях СВО.',
    category: 'methodology',
    ageGroup: 'Для педагогов',
    downloadUrl: '/materials/methodology/patrioticheskoe-vospitanie.pdf',
    fileType: 'pdf',
    topics: ['Педагогика', 'Воспитание', 'Методика'],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
  {
    id: 'methodology-2',
    title: 'Работа с эмоционально сложными темами',
    description: 'Рекомендации психологов по проведению уроков памяти и разговоров с детьми о войне, потере и героизме.',
    category: 'methodology',
    ageGroup: 'Для педагогов',
    downloadUrl: '/materials/methodology/emotsionalnye-temy.pdf',
    fileType: 'pdf',
    topics: ['Психология', 'Педагогика', 'Этика'],
    createdAt: '2024-01-30',
    updatedAt: '2024-01-30',
  },
  {
    id: 'methodology-3',
    title: 'Интеграция в школьную программу',
    description: 'Практические советы по встраиванию материалов о героях СВО в различные предметы: историю, обществознание, литературу, ОБЖ.',
    category: 'methodology',
    ageGroup: 'Для педагогов',
    downloadUrl: '/materials/methodology/integratsiya-v-programmu.pdf',
    fileType: 'pdf',
    topics: ['Методика', 'Программа', 'Интеграция'],
    createdAt: '2024-02-25',
    updatedAt: '2024-02-25',
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const ageGroup = searchParams.get('ageGroup')
    const topic = searchParams.get('topic')

    let filteredMaterials = mockMaterials

    // Фильтрация по категории
    if (category) {
      filteredMaterials = filteredMaterials.filter((m) => m.category === category)
    }

    // Фильтрация по возрастной группе
    if (ageGroup) {
      filteredMaterials = filteredMaterials.filter((m) => m.ageGroup.includes(ageGroup))
    }

    // Фильтрация по теме
    if (topic) {
      filteredMaterials = filteredMaterials.filter((m) => m.topics.includes(topic))
    }

    return NextResponse.json({
      materials: filteredMaterials,
      total: filteredMaterials.length,
    })
  } catch (error) {
    console.error('Error in education API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
