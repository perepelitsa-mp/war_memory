import imageCompression from 'browser-image-compression'

/**
 * Опции сжатия изображений для проекта
 */
export interface CompressionOptions {
  /**
   * Максимальный размер в MB (по умолчанию 1 MB)
   */
  maxSizeMB?: number
  /**
   * Максимальная ширина в пикселях (по умолчанию 1920px)
   */
  maxWidthOrHeight?: number
  /**
   * Использовать WebP формат (по умолчанию true)
   */
  useWebP?: boolean
  /**
   * Качество изображения 0-1 (по умолчанию 0.85)
   */
  quality?: number
  /**
   * Тип изображения для конвертации
   * 'hero' - фото героя (высокое качество)
   * 'gallery' - фото в галерее (стандартное качество)
   * 'avatar' - аватар пользователя (маленький размер)
   * 'timeline' - фото в таймлайне (стандартное качество)
   */
  imageType?: 'hero' | 'gallery' | 'avatar' | 'timeline'
}

/**
 * Предустановленные настройки для разных типов изображений
 */
const PRESET_OPTIONS: Record<string, CompressionOptions> = {
  hero: {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    quality: 0.9,
    useWebP: true,
  },
  gallery: {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1920,
    quality: 0.85,
    useWebP: true,
  },
  avatar: {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 512,
    quality: 0.8,
    useWebP: true,
  },
  timeline: {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1920,
    quality: 0.85,
    useWebP: true,
  },
}

/**
 * Сжимает и конвертирует изображение в WebP формат
 *
 * @param file - Исходный файл изображения
 * @param options - Опции сжатия
 * @returns Promise с сжатым файлом
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Если не указан тип, используем стандартные настройки
  const preset = options.imageType ? PRESET_OPTIONS[options.imageType] : {}

  const finalOptions = {
    maxSizeMB: options.maxSizeMB ?? preset.maxSizeMB ?? 1,
    maxWidthOrHeight: options.maxWidthOrHeight ?? preset.maxWidthOrHeight ?? 1920,
    useWebWorker: true,
    fileType: options.useWebP ?? preset.useWebP ?? true ? 'image/webp' : undefined,
    initialQuality: options.quality ?? preset.quality ?? 0.85,
  }

  try {
    const compressedFile = await imageCompression(file, finalOptions)

    // Если конвертируем в WebP, меняем расширение файла
    if (finalOptions.fileType === 'image/webp' && !file.name.endsWith('.webp')) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      return new File([compressedFile], `${nameWithoutExt}.webp`, {
        type: 'image/webp',
        lastModified: Date.now(),
      })
    }

    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Не удалось сжать изображение. Попробуйте другой файл.')
  }
}

/**
 * Сжимает массив изображений
 *
 * @param files - Массив файлов изображений
 * @param options - Опции сжатия
 * @param onProgress - Callback для отслеживания прогресса
 * @returns Promise с массивом сжатых файлов
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressedFiles: File[] = []

  for (let i = 0; i < files.length; i++) {
    try {
      const compressed = await compressImage(files[i], options)
      compressedFiles.push(compressed)

      if (onProgress) {
        onProgress(i + 1, files.length)
      }
    } catch (error) {
      console.error(`Error compressing file ${files[i].name}:`, error)
      // Пропускаем файл, который не удалось сжать
      continue
    }
  }

  return compressedFiles
}

/**
 * Получает информацию о размере изображения
 *
 * @param file - Файл изображения
 * @returns Promise с размерами изображения
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Проверяет, является ли файл изображением
 *
 * @param file - Файл для проверки
 * @returns true если файл является изображением
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Форматирует размер файла для отображения
 *
 * @param bytes - Размер в байтах
 * @returns Отформатированная строка (например "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Создает превью изображения
 *
 * @param file - Файл изображения
 * @returns Promise с data URL превью
 */
export async function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}
