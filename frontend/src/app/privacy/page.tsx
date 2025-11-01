import { Shield, Lock, Eye, FileText, UserCheck, Clock, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Политика конфиденциальности — Память героев',
  description:
    'Политика обработки персональных данных на платформе цифрового мемориала в соответствии с законодательством РФ',
}

export default function PrivacyPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--glow)/0.18),_transparent_55%),radial-gradient(circle_at_bottom_right,_hsl(var(--primary)/0.15),_transparent_50%)]" />
      <div className="container max-w-5xl space-y-12 py-16 md:space-y-16 md:py-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 px-6 py-12 shadow-soft md:px-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,_hsl(var(--primary)/0.2),_transparent_45%),radial-gradient(circle_at_80%_0%,_hsl(var(--glow)/0.15),_transparent_45%)] opacity-80 mix-blend-soft-light" />
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Политика конфиденциальности
              </h1>
              <p className="mx-auto max-w-2xl text-base text-foreground/75">
                Мы заботимся о защите ваших данных и памяти ваших близких в соответствии с законодательством Российской
                Федерации
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
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Безопасность данных</h3>
            <p className="text-sm text-foreground/70">
              Все данные хранятся на защищенных серверах на территории РФ с соблюдением 152-ФЗ
            </p>
          </div>
          <div className="group rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft transition hover:border-primary/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Прозрачность</h3>
            <p className="text-sm text-foreground/70">
              Мы открыто сообщаем, какие данные собираем и для чего они используются
            </p>
          </div>
          <div className="group rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft transition hover:border-primary/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Ваши права</h3>
            <p className="text-sm text-foreground/70">
              Вы имеете полный контроль над своими данными и можете в любой момент их удалить
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="space-y-8">
          {/* 1. Общие положения */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">1. Общие положения</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>
                  Настоящая Политика конфиденциальности (далее — Политика) определяет порядок обработки и защиты персональных
                  данных пользователей платформы «Память героев» (далее — Платформа, Сайт).
                </p>
                <p>
                  Оператором персональных данных является [Наименование организации/ИП], ОГРН [номер], ИНН [номер], адрес:
                  [юридический адрес] (далее — Оператор, Мы).
                </p>
                <p>
                  Использование Платформы означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней
                  условиями обработки персональных данных. В случае несогласия с условиями Политики Пользователь должен
                  воздержаться от использования Платформы.
                </p>
                <p className="font-medium text-foreground">
                  Обработка персональных данных осуществляется в соответствии с требованиями Федерального закона от 27.07.2006
                  № 152-ФЗ «О персональных данных» и иным применимым законодательством Российской Федерации.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Какие данные собираем */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Какие персональные данные мы собираем</h2>
              <div className="space-y-4 text-sm leading-relaxed text-foreground/75">
                <p>При использовании Платформы мы можем обрабатывать следующие категории персональных данных:</p>
                <div className="space-y-3">
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">2.1. Данные, предоставляемые при регистрации:</h3>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>Фамилия, имя, отчество</li>
                      <li>Номер телефона</li>
                      <li>Адрес электронной почты</li>
                      <li>Аватар (фотография профиля) — по желанию</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">
                      2.2. Данные о погибших героях (при создании мемориальной карточки):
                    </h3>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>ФИО погибшего</li>
                      <li>Даты рождения и гибели</li>
                      <li>Место службы, звание, подразделение</li>
                      <li>Биографические данные</li>
                      <li>Фотографии и видеоматериалы</li>
                      <li>Место захоронения и его координаты</li>
                      <li>Информация о наградах</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">
                      2.3. Данные, собираемые автоматически при использовании Платформы:
                    </h3>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>IP-адрес</li>
                      <li>Тип браузера и операционной системы</li>
                      <li>Информация о просмотренных страницах и действиях на Сайте</li>
                      <li>Дата и время посещения</li>
                      <li>Cookie-файлы и аналогичные технологии</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">
                      2.4. Данные, необходимые для подтверждения родства:
                    </h3>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>Документы, подтверждающие родственные отношения (при создании карточки погибшего)</li>
                      <li>Указание степени родства</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Цели обработки */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Цели обработки персональных данных</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>Мы обрабатываем персональные данные исключительно для следующих целей:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Создание и ведение учетной записи Пользователя на Платформе</li>
                  <li>Публикация и хранение мемориальных карточек погибших героев</li>
                  <li>Обеспечение функционирования интерактивных возможностей (комментарии, воспоминания, таймлайн событий)</li>
                  <li>Модерация контента в соответствии с правилами Платформы</li>
                  <li>Отправка уведомлений о событиях на Платформе (через Telegram и email)</li>
                  <li>Улучшение качества и удобства использования Платформы</li>
                  <li>Защита прав и законных интересов Оператора и Пользователей</li>
                  <li>Соблюдение требований законодательства РФ</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Правовые основания */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Правовые основания обработки</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>Правовыми основаниями обработки персональных данных являются:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    Согласие субъекта персональных данных на обработку его персональных данных (п. 1 ч. 1 ст. 6 Федерального
                    закона № 152-ФЗ)
                  </li>
                  <li>
                    Исполнение договора, стороной которого является субъект персональных данных (п. 5 ч. 1 ст. 6 Федерального
                    закона № 152-ФЗ)
                  </li>
                  <li>
                    Осуществление прав и законных интересов Оператора или третьих лиц (п. 7 ч. 1 ст. 6 Федерального закона №
                    152-ФЗ)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Сроки хранения */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">5. Сроки хранения персональных данных</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>
                  Персональные данные хранятся не дольше, чем этого требуют цели их обработки, и удаляются по достижении целей
                  обработки или в случае утраты необходимости в их достижении, если иное не предусмотрено законодательством РФ.
                </p>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-medium text-foreground">Особенности хранения данных о погибших героях:</p>
                  <p className="mt-2">
                    Мемориальные карточки и связанные с ними данные хранятся <strong>бессрочно</strong> в целях сохранения
                    исторической памяти, если владелец карточки не направит запрос на их удаление.
                  </p>
                </div>
                <p>
                  При этом применяется технология «мягкого удаления» (soft delete): данные помечаются как удалённые, но физически
                  сохраняются в системе для возможности восстановления и соблюдения требований законодательства.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Ваши права */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Права субъектов персональных данных</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>В соответствии с законодательством РФ Вы имеете следующие права:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Получать информацию о том, какие Ваши персональные данные обрабатываются Оператором</li>
                  <li>Требовать уточнения, блокирования или удаления недостоверных или обработанных незаконно данных</li>
                  <li>Отозвать согласие на обработку персональных данных</li>
                  <li>Требовать прекращения обработки персональных данных</li>
                  <li>Обжаловать действия или бездействие Оператора в уполномоченный орган по защите прав субъектов персональных данных или в судебном порядке</li>
                </ul>
                <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <p className="font-medium text-foreground">Как реализовать свои права:</p>
                  <p className="mt-2">
                    Для реализации указанных прав направьте письменный запрос на адрес электронной почты:{' '}
                    <a href="mailto:privacy@memory-heroes.ru" className="font-medium text-primary hover:underline">
                      privacy@memory-heroes.ru
                    </a>
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Мы обязуемся рассмотреть Ваше обращение в течение 30 дней с момента получения.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Защита данных */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">7. Меры защиты персональных данных</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>
                  Оператор принимает все необходимые организационные и технические меры для защиты персональных данных от
                  неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а
                  также от иных неправомерных действий.
                </p>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Применяемые меры защиты:</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Шифрование данных при передаче (SSL/TLS-сертификаты)</li>
                    <li>Хранение паролей в зашифрованном виде (хеширование)</li>
                    <li>Разграничение прав доступа сотрудников к персональным данным</li>
                    <li>Регулярное резервное копирование данных</li>
                    <li>Мониторинг и аудит действий с персональными данными</li>
                    <li>Использование защищенных серверов, расположенных на территории РФ</li>
                    <li>Антивирусная защита и межсетевые экраны</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Cookies */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Использование cookie и аналогичных технологий</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>
                  Платформа использует файлы cookie — небольшие текстовые файлы, которые сохраняются на Вашем устройстве при
                  посещении Сайта.
                </p>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Мы используем следующие типы cookie:</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>
                      <strong>Технические cookie</strong> — необходимы для функционирования Платформы (авторизация, сохранение
                      настроек)
                    </li>
                    <li>
                      <strong>Аналитические cookie</strong> — позволяют анализировать посещаемость и улучшать Платформу
                    </li>
                  </ul>
                </div>
                <p>
                  Вы можете настроить или отключить использование cookie в настройках Вашего браузера. Однако это может привести
                  к ограничению функциональности Платформы.
                </p>
              </div>
            </div>
          </section>

          {/* 9. Передача данных */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Передача персональных данных третьим лицам</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>
                  Оператор не передает персональные данные третьим лицам, за исключением случаев, предусмотренных
                  законодательством РФ, или с Вашего согласия.
                </p>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Исключения:</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>
                      Передача данных поставщикам технических услуг (хостинг, аналитика) при условии соблюдения ими
                      конфиденциальности
                    </li>
                    <li>Передача данных по запросу уполномоченных государственных органов в случаях, предусмотренных законом</li>
                  </ul>
                </div>
                <div className="mt-4 rounded-lg bg-muted/50 p-4">
                  <p className="font-medium text-foreground">Важно:</p>
                  <p className="mt-2">
                    Все данные хранятся исключительно на серверах, расположенных на территории Российской Федерации.
                    Трансграничная передача персональных данных не осуществляется.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 10. Изменения */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. Изменения в Политике конфиденциальности</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>
                  Оператор оставляет за собой право вносить изменения в настоящую Политику. Новая редакция Политики вступает в
                  силу с момента её размещения на Платформе, если иное не предусмотрено новой редакцией.
                </p>
                <p>
                  Действующая редакция Политики всегда доступна на странице:{' '}
                  <Link href="/privacy" className="font-medium text-primary hover:underline">
                    https://memory-heroes.ru/privacy
                  </Link>
                </p>
                <p className="font-medium text-foreground">
                  Мы рекомендуем регулярно просматривать данную страницу для ознакомления с актуальной информацией о том, как мы
                  защищаем Ваши персональные данные.
                </p>
              </div>
            </div>
          </section>

          {/* 11. Контакты */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">11. Контактная информация</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>
                  По вопросам, связанным с обработкой персональных данных, Вы можете обратиться к Оператору следующими
                  способами:
                </p>
                <div className="space-y-2 rounded-lg border border-border/50 bg-background/50 p-4">
                  <p>
                    <strong>Оператор персональных данных:</strong> [Наименование организации/ИП]
                  </p>
                  <p>
                    <strong>Юридический адрес:</strong> [Адрес]
                  </p>
                  <p>
                    <strong>ОГРН:</strong> [номер]
                  </p>
                  <p>
                    <strong>ИНН:</strong> [номер]
                  </p>
                  <p>
                    <strong>Email для обращений по вопросам персональных данных:</strong>{' '}
                    <a href="mailto:privacy@memory-heroes.ru" className="font-medium text-primary hover:underline">
                      privacy@memory-heroes.ru
                    </a>
                  </p>
                  <p>
                    <strong>Общий email поддержки:</strong>{' '}
                    <a href="mailto:support@memory-heroes.ru" className="font-medium text-primary hover:underline">
                      support@memory-heroes.ru
                    </a>
                  </p>
                </div>
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="font-medium text-foreground">Уполномоченный орган по защите прав субъектов персональных данных:</p>
                  <p className="mt-2">
                    Федеральная служба по надзору в сфере связи, информационных технологий и массовых коммуникаций
                    (Роскомнадзор)
                  </p>
                  <p className="mt-1">
                    Адрес: 109074, г. Москва, Китайгородский проезд, д. 7, стр. 2
                  </p>
                  <p>
                    Официальный сайт:{' '}
                    <a
                      href="https://rkn.gov.ru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      rkn.gov.ru
                    </a>
                  </p>
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
              Остались вопросы о конфиденциальности?
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-foreground/70">
              Мы всегда готовы ответить на Ваши вопросы и помочь разобраться в том, как мы защищаем Ваши данные
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
