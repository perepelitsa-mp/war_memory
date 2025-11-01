import { FileCheck, Shield, UserCheck, Lock, Clock, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Согласие на обработку персональных данных — Память героев',
  description:
    'Согласие субъекта персональных данных на обработку персональных данных на платформе цифрового мемориала',
}

export default function ConsentPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--glow)/0.18),_transparent_55%),radial-gradient(circle_at_bottom_right,_hsl(var(--primary)/0.15),_transparent_50%)]" />
      <div className="container max-w-5xl space-y-12 py-16 md:space-y-16 md:py-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 px-6 py-12 shadow-soft md:px-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,_hsl(var(--primary)/0.2),_transparent_45%),radial-gradient(circle_at_80%_0%,_hsl(var(--glow)/0.15),_transparent_45%)] opacity-80 mix-blend-soft-light" />
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Согласие на обработку персональных данных
              </h1>
              <p className="mx-auto max-w-2xl text-base text-foreground/75">
                Форма согласия субъекта персональных данных в соответствии с Федеральным законом № 152-ФЗ
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <p>
                Дата вступления в силу: <span className="font-medium text-foreground">1 января 2025 г.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Key Info */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Защита ваших прав</h3>
            <p className="text-sm text-foreground/70">
              Согласие оформляется в соответствии с требованиями 152-ФЗ «О персональных данных» и защищает ваши права
            </p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-background/70 p-6 shadow-soft">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Добровольность</h3>
            <p className="text-sm text-foreground/70">
              Согласие дается добровольно и может быть отозвано в любой момент по вашему письменному заявлению
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Преамбула */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p className="text-base font-semibold text-foreground">
                  Настоящим я, субъект персональных данных (далее — Субъект), в соответствии с Федеральным законом от
                  27.07.2006 № 152-ФЗ «О персональных данных»:
                </p>
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <p className="font-medium text-foreground">
                    Подтверждаю свое согласие на обработку моих персональных данных Оператором — [Наименование
                    организации/ИП], ОГРН [номер], ИНН [номер], расположенным по адресу: [юридический адрес] (далее —
                    Оператор).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 1. Перечень персональных данных */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                1. Перечень персональных данных, на обработку которых дается согласие
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>Настоящим я даю согласие на обработку следующих моих персональных данных:</p>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">1.1. Обязательные данные:</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Фамилия, имя, отчество</li>
                    <li>Номер мобильного телефона</li>
                    <li>Адрес электронной почты (при указании)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">1.2. Данные, предоставляемые по желанию Субъекта:</h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Аватар (фотография профиля)</li>
                    <li>Дополнительные контактные данные</li>
                    <li>Биографическая информация</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    1.3. Данные о погибших героях (при создании мемориальных карточек):
                  </h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>ФИО погибшего, даты рождения и гибели</li>
                    <li>Фотографии, видеоматериалы, биографическая информация</li>
                    <li>Данные о военной службе, наградах, месте захоронения</li>
                    <li>Документы, подтверждающие родство с погибшим</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Цели обработки */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">2. Цели обработки персональных данных</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>Согласие дается на обработку персональных данных для следующих целей:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    Регистрация и ведение учетной записи Субъекта на платформе «Память героев» (далее — Платформа)
                  </li>
                  <li>Идентификация Субъекта при использовании Платформы</li>
                  <li>Создание и публикация мемориальных карточек погибших героев</li>
                  <li>
                    Обеспечение функционирования интерактивных возможностей Платформы (комментарии, воспоминания, события
                    жизни)
                  </li>
                  <li>Модерация контента и обеспечение соблюдения правил Платформы</li>
                  <li>Отправка уведомлений о событиях на Платформе через Telegram и электронную почту</li>
                  <li>Улучшение качества работы Платформы и предоставляемых услуг</li>
                  <li>Обеспечение защиты прав и законных интересов Оператора и Субъекта</li>
                  <li>Исполнение требований законодательства Российской Федерации</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Перечень действий с персональными данными */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                3. Перечень действий с персональными данными, на которые дается согласие
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>Настоящим я даю согласие на совершение Оператором следующих действий с моими персональными данными:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Сбор</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Запись</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Систематизация</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Накопление</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Хранение</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Уточнение (обновление, изменение)</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Извлечение</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Использование</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Передача (распространение, предоставление, доступ)</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Обезличивание</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Блокирование</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Удаление</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="font-medium text-foreground">Уничтожение</p>
                  </div>
                </div>
                <p className="mt-3">
                  Обработка персональных данных осуществляется как с использованием средств автоматизации, так и без
                  использования таких средств.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Срок действия согласия */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">4. Срок действия согласия и порядок его отзыва</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">4.1. Срок действия согласия</h3>
                  <p>
                    Настоящее согласие действует с момента его предоставления и до момента его отзыва Субъектом либо до
                    достижения целей обработки персональных данных.
                  </p>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="font-medium text-foreground">Особенности хранения мемориальных данных:</p>
                    <p className="mt-2">
                      Данные о погибших героях, размещенные в мемориальных карточках, хранятся{' '}
                      <strong>бессрочно</strong> в целях сохранения исторической памяти, если владелец карточки не
                      направит запрос на их удаление.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">4.2. Порядок отзыва согласия</h3>
                  <p>
                    Субъект вправе отозвать настоящее согласие, направив Оператору письменное заявление (или заявление в
                    форме электронного документа) на адрес электронной почты:{' '}
                    <a href="mailto:privacy@memory-heroes.ru" className="font-medium text-primary hover:underline">
                      privacy@memory-heroes.ru
                    </a>
                  </p>
                  <p>
                    Оператор обязуется прекратить обработку персональных данных и удалить персональные данные в срок, не
                    превышающий 30 (тридцати) дней с даты поступления указанного отзыва, за исключением случаев, когда
                    сохранение персональных данных предусмотрено законодательством РФ.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Способы обработки */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">5. Способы и условия обработки</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>Оператор обязуется:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    Обрабатывать персональные данные в соответствии с требованиями Федерального закона № 152-ФЗ «О
                    персональных данных»
                  </li>
                  <li>
                    Хранить персональные данные на серверах, расположенных исключительно на территории Российской Федерации
                  </li>
                  <li>
                    Обеспечивать конфиденциальность персональных данных и принимать все необходимые меры для их защиты от
                    неправомерного доступа
                  </li>
                  <li>
                    Не передавать персональные данные третьим лицам без согласия Субъекта, за исключением случаев,
                    предусмотренных законодательством РФ
                  </li>
                  <li>
                    Обеспечивать возможность реализации Субъектом всех прав, предусмотренных законодательством о
                    персональных данных
                  </li>
                </ul>
                <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <p className="font-medium text-foreground">Меры защиты:</p>
                  <p className="mt-2">
                    Применяется шифрование данных при передаче (SSL/TLS), хеширование паролей, разграничение прав доступа,
                    регулярное резервное копирование, антивирусная защита и межсетевые экраны.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Права субъекта */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Права субъекта персональных данных</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <p>Субъект имеет право:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    Получать информацию, касающуюся обработки его персональных данных, в том числе содержащую:
                    <ul className="ml-6 mt-1 list-circle space-y-1">
                      <li>Подтверждение факта обработки персональных данных Оператором</li>
                      <li>Правовые основания и цели обработки</li>
                      <li>Способы обработки, применяемые Оператором</li>
                      <li>Сведения о лицах, которые имеют доступ к персональным данным</li>
                      <li>Перечень обрабатываемых персональных данных и источник их получения</li>
                      <li>Сроки обработки персональных данных</li>
                    </ul>
                  </li>
                  <li>Требовать от Оператора уточнения, блокирования или удаления недостоверных или незаконно обработанных персональных данных</li>
                  <li>Отзывать согласие на обработку персональных данных</li>
                  <li>Обжаловать действия или бездействие Оператора в уполномоченный орган по защите прав субъектов персональных данных или в судебном порядке</li>
                  <li>На защиту своих прав и законных интересов, в том числе на возмещение убытков и (или) компенсацию морального вреда</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Подтверждение */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Подтверждение субъекта</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <p className="font-medium text-foreground">Настоящим я подтверждаю, что:</p>
                  <ul className="ml-6 mt-2 list-disc space-y-1">
                    <li>Ознакомлен(а) с положениями Федерального закона № 152-ФЗ «О персональных данных»</li>
                    <li>
                      Ознакомлен(а) с{' '}
                      <Link
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        Политикой конфиденциальности
                      </Link>{' '}
                      Оператора
                    </li>
                    <li>
                      Ознакомлен(а) с{' '}
                      <Link
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        Пользовательским соглашением
                      </Link>
                    </li>
                    <li>Настоящее согласие дается мною свободно, по своей воле и в своем интересе</li>
                    <li>
                      Я проинформирован(а) о праве отозвать настоящее согласие путем направления письменного заявления
                      Оператору
                    </li>
                  </ul>
                </div>
                <div className="mt-4 rounded-lg bg-muted/50 p-4">
                  <p className="font-medium text-foreground">Способ предоставления согласия:</p>
                  <p className="mt-2">
                    Согласие считается предоставленным путем проставления соответствующей отметки (галочки) в регистрационной
                    форме при создании учетной записи на Платформе либо при авторизации на Платформе.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Контакты */}
          <section className="rounded-3xl border border-border/50 bg-background/70 p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Контактная информация Оператора</h2>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/75">
                <div className="space-y-2 rounded-lg border border-border/50 bg-background/50 p-4">
                  <p>
                    <strong>Наименование:</strong> [Наименование организации/ИП]
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
                    <strong>Email для вопросов о персональных данных:</strong>{' '}
                    <a href="mailto:privacy@memory-heroes.ru" className="font-medium text-primary hover:underline">
                      privacy@memory-heroes.ru
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
            <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">Вопросы о согласии?</h2>
            <p className="mx-auto max-w-2xl text-sm text-foreground/70">
              Мы всегда готовы разъяснить порядок обработки ваших персональных данных и ответить на любые вопросы
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
                <Link href="/privacy">Политика конфиденциальности</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
