# Icons Architecture

## 📁 Структура

Все кастомные иконки хранятся как React компоненты в `/src/components/icons/`.

```
src/components/icons/
├── RankIcon.tsx        # Иконка звания
├── UnitIcon.tsx        # Иконка подразделения
├── ServiceIcon.tsx     # Иконка вида службы
├── index.ts            # Центральный экспорт
└── README.md           # Эта документация
```

## 🎯 Почему React компоненты?

### ✅ Преимущества:
- **Tree-shaking** - только используемые иконки попадают в бандл
- **Управление через props** - легко менять размер и цвет
- **TypeScript типизация** - безопасность типов
- **Нет HTTP-запросов** - иконки встраиваются в JS бандл
- **Консистентность** - единый стиль с Lucide Icons

### ❌ Чего избегаем:
- `/public/icons/` для компонентных иконок
- `next/image` для SVG иконок
- HTTP-запросы на каждую иконку

## 📝 Как добавить новую иконку

### 1. Создать компонент

```tsx
// src/components/icons/MyIcon.tsx
import { SVGProps } from 'react'

interface MyIconProps extends SVGProps<SVGSVGElement> {
  className?: string
}

export function MyIcon({ className, ...props }: MyIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      {/* SVG content */}
    </svg>
  )
}
```

### 2. Добавить в index.ts

```tsx
// src/components/icons/index.ts
export { RankIcon } from './RankIcon'
export { UnitIcon } from './UnitIcon'
export { ServiceIcon } from './ServiceIcon'
export { MyIcon } from './MyIcon'  // ← новая иконка
```

### 3. Использовать в компонентах

```tsx
import { MyIcon } from '@/components/icons'

<Label className="flex items-center gap-2">
  <MyIcon className="h-4 w-4" />
  Моё поле
</Label>
```

## 🎨 Стилизация

### Размеры
```tsx
<RankIcon className="h-4 w-4" />    // 16x16px
<RankIcon className="h-6 w-6" />    // 24x24px
<RankIcon className="h-8 w-8" />    // 32x32px
```

### Цвета (через gradients)
Наши иконки используют встроенные градиенты в цветах георгиевской ленты:
- `#FF8C00` → `#C06000` (оранжевый → коричневый)

Если нужна монохромная иконка, используйте Lucide Icons или уберите gradients.

## 📊 Текущие иконки

| Компонент | Использование | Файл |
|-----------|---------------|------|
| `RankIcon` | Звание | [RankIcon.tsx](./RankIcon.tsx) |
| `UnitIcon` | Подразделение | [UnitIcon.tsx](./UnitIcon.tsx) |
| `ServiceIcon` | Вид службы | [ServiceIcon.tsx](./ServiceIcon.tsx) |
| `HometownIcon` | Родной город | [HometownIcon.tsx](./HometownIcon.tsx) |
| `BurialIcon` | Место захоронения | [BurialIcon.tsx](./BurialIcon.tsx) |

## 🔧 Рекомендации

1. **Для стандартных иконок** используйте Lucide Icons:
   ```tsx
   import { User, Calendar, MapPin } from 'lucide-react'
   ```

2. **Для кастомных иконок** создавайте React компоненты в этой директории

3. **Для статических файлов** (favicon, Open Graph images) используйте `/public/`

4. **Никогда не используйте** `next/image` для SVG иконок в UI

## 📚 Ссылки

- [Lucide Icons](https://lucide.dev/) - библиотека стандартных иконок
- [SVG Props](https://react-typescript-cheatsheet.netlify.app/docs/advanced/patterns_by_usecase/#svg-icons) - TypeScript типы для SVG
