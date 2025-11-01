import { FileText, Users, Shield, AlertCircle, Scale } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Пользовательское соглашение — Память героев',
  description: 'Правила использования платформы цифрового мемориала памяти героев СВО',
}

export default function TermsPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--glow)/0.18),_transparent_55%),radial-gradient(circle_at_bottom_right,_hsl(var(--primary)/0.15),_transparent_50%)]" />
      <div className="container max-w-5xl space-y-12 py-16 md:space-y-16 md:py-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 px-6 py-12 shadow-soft md:px-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,_hsl(var(--primary)/0.2),_transparent_45%),radial-gradient(circle_at_80%_0%,_hsl(var(--glow)/0.15),_transparent_45%)] opacity-80 mix-blend-soft-light" />
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Пользовательское соглашение
              </h1>
              <p className="mx-auto max-w-2xl text-base text-foreground/75">
                Правила и условия использования платформы «Память героев»
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <p>
                Дата вступления в силу: <span className="font-medium text-foreground">1 января 2025 г.</span>
              </p>
              <p>
                Последнее обновление: <span className="font-medium text-foreground">1 января 2025 г.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Key Principles */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="group rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft transition hover:border-primary/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Уважение и память</h3>
            <p className="text-sm text-foreground/70">
              Главный принцип — бережное отношение к памяти погибших героев и их близких
            </p>
          </div>
          <div className="group rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft transition hover:border-primary/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Сообщество</h3>
            <p className="text-sm text-foreground/70">
              Мы создаем безопасное пространство для родных и друзей героев
            </p>
          </div>
          <div className="group rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft transition hover:border-primary/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Scale className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Ответственность</h3>
            <p className="text-sm text-foreground/70">
              Каждый пользователь несет ответственность за публикуемую информацию
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="space-y-8">
          {/* 1. Общие положения */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Общие положения</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>
                  Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между администрацией
                  платформы «Память героев» (далее — Платформа, Администрация, Мы) и пользователями Платформы (далее —
                  Пользователь, Вы).
                </p>
                <p>
                  Используя Платформу, Вы подтверждаете, что ознакомились с условиями настоящего Соглашения и принимаете их в
                  полном объеме. Если Вы не согласны с условиями Соглашения, Вы должны прекратить использование Платформы.
                </p>
                <p className="font-medium text-foreground">
                  Платформа «Память героев» — это некоммерческий проект, созданный для сохранения памяти о погибших в ходе
                  специальной военной операции.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Регистрация и учетная запись */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Регистрация и учетная запись</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">2.1. Процесс регистрации</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Для использования полного функционала Платформы необходимо пройти регистрацию</li>
                    <li>При регистрации Вы обязаны предоставить достоверные и актуальные данные</li>
                    <li>Вы несете ответственность за сохранность данных учетной записи и все действия, совершенные с ее использованием</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">2.2. Требования к пользователям</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Пользователем Платформы может стать лицо, достигшее 14 лет (для лиц от 14 до 18 лет — с согласия законных представителей)</li>
                    <li>Запрещается создание нескольких учетных записей одним лицом</li>
                    <li>Запрещается передавать доступ к своей учетной записи третьим лицам</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Создание мемориальных карточек */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Создание мемориальных карточек</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <p className="font-medium text-foreground">Важное правило:</p>
                  <p className="mt-2">
                    Мемориальную карточку погибшего героя имеет право создать <strong>только близкий родственник</strong>:
                    супруг(а), родитель, ребенок, брат/сестра, бабушка/дедушка или опекун.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">3.1. Требования к созданию карточки</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>При создании карточки необходимо предоставить документ, подтверждающий родство с погибшим</li>
                    <li>Все карточки проходят обязательную премодерацию Администрацией</li>
                    <li>Информация о погибшем должна быть достоверной и подтвержденной</li>
                    <li>Запрещается публикация ложной или вводящей в заблуждение информации</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">3.2. Владение карточкой</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Создатель карточки становится ее владельцем с правом редактирования</li>
                    <li>Владелец может назначить дополнительных редакторов из числа родственников</li>
                    <li>Владелец модерирует материалы памяти и комментарии к карточке</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Правила публикации контента */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">4. Правила публикации контента</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">4.1. Разрешенный контент</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Фотографии и видео погибших героев</li>
                    <li>Биографическая информация и истории из жизни</li>
                    <li>События жизненного пути (таймлайн)</li>
                    <li>Воспоминания родных и друзей</li>
                    <li>Слова соболезнования и поддержки</li>
                    <li>Информация о наградах и достижениях</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">4.2. Запрещенный контент</h3>
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <p className="mb-2 font-medium text-foreground">Строго запрещается публикация:</p>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>Недостоверной информации и клеветы</li>
                      <li>Оскорбительных или унижающих материалов</li>
                      <li>Экстремистских материалов и призывов к насилию</li>
                      <li>Материалов порнографического характера</li>
                      <li>Пропаганды наркотиков, алкоголя, табака</li>
                      <li>Материалов, нарушающих права третьих лиц</li>
                      <li>Спама и рекламы (без согласования с Администрацией)</li>
                      <li>Материалов, нарушающих законодательство РФ</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">4.3. Модерация контента</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Все материалы памяти проходят постмодерацию владельцем карточки</li>
                    <li>Администрация оставляет за собой право удалить контент, нарушающий правила</li>
                    <li>При систематических нарушениях учетная запись может быть заблокирована</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Интеллектуальная собственность */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Интеллектуальная собственность</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">5.1. Права на публикуемый контент</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Публикуя контент на Платформе, Вы подтверждаете, что обладаете всеми необходимыми правами на него</li>
                    <li>Вы сохраняете все права на публикуемый Вами контент</li>
                    <li>Вы предоставляете Платформе неисключительную лицензию на использование контента в целях функционирования Платформы</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">5.2. Права на элементы Платформы</h3>
                  <p>
                    Все элементы Платформы (дизайн, код, логотипы, тексты) являются интеллектуальной собственностью
                    Администрации и защищены законодательством РФ об интеллектуальной собственности.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Ответственность сторон */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Ответственность сторон</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">6.1. Ответственность Пользователя</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Вы несете полную ответственность за публикуемый контент</li>
                    <li>Вы обязуетесь соблюдать правила Платформы и законодательство РФ</li>
                    <li>Вы несете ответственность за действия, совершенные с использованием Вашей учетной записи</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">6.2. Ответственность Администрации</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Администрация обязуется обеспечивать работоспособность Платформы</li>
                    <li>Администрация обязуется защищать персональные данные пользователей</li>
                    <li>Администрация не несет ответственности за содержание пользовательского контента</li>
                    <li>Администрация не гарантирует отсутствие перерывов в работе Платформы</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Изменение и прекращение использования */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Изменение и прекращение использования</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">7.1. Изменение Соглашения</h3>
                  <p>
                    Администрация имеет право вносить изменения в настоящее Соглашение. Новая редакция Соглашения вступает в
                    силу с момента ее размещения на Платформе.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">7.2. Прекращение использования</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Вы можете в любой момент прекратить использование Платформы</li>
                    <li>Вы можете удалить свою учетную запись через настройки профиля</li>
                    <li>Администрация может заблокировать учетную запись при нарушении правил</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Разрешение споров */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Разрешение споров</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>
                  При возникновении споров стороны обязуются в первую очередь попытаться урегулировать их путем переговоров.
                </p>
                <p>
                  В случае невозможности разрешения спора в досудебном порядке, споры подлежат разрешению в судебном порядке в
                  соответствии с законодательством Российской Федерации.
                </p>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-medium text-foreground">Контакт для обращений:</p>
                  <p className="mt-2">
                    Email:{' '}
                    <a href="mailto:support@memory-heroes.ru" className="font-medium text-primary hover:underline">
                      support@memory-heroes.ru
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 9. Прочие условия */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Прочие условия</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    Настоящее Соглашение регулируется и толкуется в соответствии с законодательством Российской Федерации
                  </li>
                  <li>
                    Признание судом какого-либо положения Соглашения недействительным не влечет недействительности иных
                    положений
                  </li>
                  <li>Бездействие со стороны Администрации в случае нарушения Соглашения не лишает ее права предпринять соответствующие действия позднее</li>
                </ul>
                <div className="mt-4 rounded-lg border border-border/50 bg-background/50 p-4">
                  <p className="font-medium text-foreground">Связанные документы:</p>
                  <ul className="mt-2 space-y-1">
                    <li>
                      <Link href="/privacy" className="text-primary hover:underline">
                        Политика конфиденциальности
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/80 p-10 text-center shadow-glow">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(var(--primary)/0.2),_transparent_60%)] blur-2xl" />
          <div className="relative space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
              Вопросы о правилах использования?
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-foreground/70">
              Мы всегда готовы помочь разобраться в правилах и ответить на Ваши вопросы
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/contact">Связаться с нами</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border/60 text-foreground/80 hover:bg-background/60"
                asChild
              >
                <Link href="/about">О проекте</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
