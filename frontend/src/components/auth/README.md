# Компоненты авторизации

Модуль авторизации/регистрации для проекта "Книга Памяти Кавалерово".

## Компоненты

### AuthButton
Кнопка входа с анимацией открытия модального окна.

**Props:**
- `variant?: 'default' | 'ghost' | 'outline'` - стиль кнопки (по умолчанию: 'ghost')
- `size?: 'default' | 'sm' | 'lg' | 'icon'` - размер кнопки (по умолчанию: 'sm')
- `className?: string` - дополнительные CSS классы
- `children?: React.ReactNode` - кастомный контент кнопки

**Использование:**
```tsx
import { AuthButton } from '@/components/auth';

<AuthButton variant="ghost" size="sm" />
```

### AuthModal
Модальное окно с переключением между формами входа и регистрации.

**Props:**
- `open: boolean` - состояние открытия модального окна
- `onOpenChange: (open: boolean) => void` - callback для изменения состояния
- `defaultMode?: 'login' | 'register'` - начальный режим (по умолчанию: 'login')

### LoginForm
Форма входа по email и паролю.

**Функционал:**
1. Ввод email
2. Ввод пароля (с возможностью показать/скрыть)
3. Авторизация через Supabase Auth

**Props:**
- `onSuccess: () => void` - callback при успешной авторизации

### RegisterForm
Форма регистрации нового пользователя.

**Поля:**
- `fullName` - ФИО (обязательно)
- `email` - Email (обязательно)
- `phone` - Номер телефона (обязательно)
- `password` - Пароль (обязательно, минимум 6 символов, буква + цифра)
- `confirmPassword` - Подтверждение пароля (обязательно)

**Функционал:**
1. Валидация данных (react-hook-form + zod)
2. Проверка совпадения паролей
3. Создание записи в таблице `users` с ролью 'user'
4. Автоматическая настройка уведомлений

**Props:**
- `onSuccess: () => void` - callback при успешной регистрации

## Анимация

### Ripple эффект
При клике на кнопку "Войти" создается эффект расширяющегося круга (ripple), который визуально "открывает" модальное окно.

Реализовано с помощью Framer Motion:
- Начальная позиция - центр кнопки
- Расширение круга радиусом 2000px
- Плавное исчезновение (fade out)

### Переключение форм
Плавная анимация смены формы входа/регистрации с эффектами:
- Fade in/out
- Slide up/down

## Валидация

### Схема LoginForm
```typescript
{
  email: string (email format),
  password: string (min: 1)
}
```

### Схема RegisterForm
```typescript
{
  fullName: string (min: 2, regex: /^[А-Яа-яЁёA-Za-z\s\-]+$/),
  email: string (email format),
  phone: string (regex: /^\+?[0-9\s\-()]+$/),
  password: string (min: 6, regex: /[A-Za-z]/, regex: /[0-9]/),
  confirmPassword: string (должен совпадать с password)
}
```

## Интеграция с Supabase

### Вход по паролю
Используется метод `signInWithPassword`:

```typescript
await supabase.auth.signInWithPassword({
  email: data.email,
  password: data.password,
});
```

### Регистрация
```typescript
await supabase.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    data: {
      full_name: data.fullName,
      phone: data.phone,
    },
  },
});
```

### Создание записи пользователя
После успешной верификации создается запись в таблице `users`:

```typescript
await supabase.from('users').insert({
  id: authData.user.id,
  phone,
  full_name: fullName,
  email: email || null,
  role: 'user',
  email_verified: false,
  notification_preferences: {
    email: !!email,
    telegram: false,
  },
  is_deleted: false,
});
```

## Настройка Supabase

Для работы авторизации по паролю необходимо настроить Supabase:

1. **Включить Email Provider:**
   - Dashboard → Authentication → Providers
   - Включить Email provider
   - Отключить email confirmation (или настроить по необходимости)

2. **Настроить .env.local:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **RLS политики:**
   - Убедитесь, что настроены политики для таблицы `users`
   - См. миграцию `00012_create_rls_policies.sql`

**Примечание:** Используется стандартная email + password авторизация через Supabase Auth. Номер телефона сохраняется как дополнительное обязательное поле в таблице `users`.

## Стилизация

Компоненты используют:
- Tailwind CSS классы
- Дизайн-токены проекта (георгиевская лента: оранжевый/черный)
- Shadcn/ui компоненты (Dialog, Input, Label, Button)
- Framer Motion для анимаций

### Цветовая схема
- Градиент кнопки: `from-ribbon-orange to-primary`
- Эффект свечения: `shadow-glow`

## TODO

- [ ] Добавить поддержку VK OAuth (уже есть поля в БД)
- [ ] Реализовать "Забыли пароль?" (если будет использоваться пароль)
- [ ] Добавить Rate Limiting для отправки SMS
- [ ] Реализовать обработку истечения срока действия кода
- [ ] Добавить повторную отправку SMS кода
- [ ] Добавить Telegram авторизацию
