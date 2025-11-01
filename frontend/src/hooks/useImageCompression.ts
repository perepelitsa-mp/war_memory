import { useState, useCallback } from 'react'
import { compressImages, formatFileSize, type CompressionOptions } from '@/lib/imageCompression'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'

interface UseImageCompressionOptions extends CompressionOptions {
  /**
   * Показывать ли уведомление об успешном сжатии
   */
  showSuccessNotification?: boolean
  /**
   * Минимальный процент экономии для показа уведомления
   */
  minSavingsPercentToNotify?: number
}

interface CompressionProgress {
  current: number
  total: number
}

/**
 * Хук для автоматического сжатия изображений при выборе файлов
 */
export function useImageCompression(options: UseImageCompressionOptions = {}) {
  const { alert } = useConfirmDialog()
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressedFiles, setCompressedFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<CompressionProgress>({ current: 0, total: 0 })

  const {
    showSuccessNotification = true,
    minSavingsPercentToNotify = 10,
    ...compressionOptions
  } = options

  /**
   * Обрабатывает выбор файлов и автоматически сжимает их
   */
  const handleFilesSelected = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || files.length === 0) {
        setCompressedFiles([])
        setProgress({ current: 0, total: 0 })
        return
      }

      setIsCompressing(true)
      const filesArray = Array.isArray(files) ? files : Array.from(files)
      setProgress({ current: 0, total: filesArray.length })

      try {
        const compressed = await compressImages(
          filesArray,
          compressionOptions,
          (current, total) => {
            setProgress({ current, total })
          }
        )

        setCompressedFiles(compressed)

        // Показываем уведомление о сжатии
        if (showSuccessNotification) {
          const originalSize = filesArray.reduce((sum, file) => sum + file.size, 0)
          const compressedSize = compressed.reduce((sum, file) => sum + file.size, 0)
          const savedSize = originalSize - compressedSize
          const savedPercent = Math.round((savedSize / originalSize) * 100)

          if (savedPercent >= minSavingsPercentToNotify) {
            await alert({
              title: 'Фотографии оптимизированы',
              description: `Сжатие: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (экономия ${savedPercent}%)`,
              confirmText: 'Отлично',
              variant: 'success',
            })
          }
        }
      } catch (error) {
        console.error('Error compressing images:', error)
        await alert({
          title: 'Ошибка сжатия',
          description:
            'Не удалось сжать некоторые изображения. Они будут загружены в исходном качестве.',
          confirmText: 'Понятно',
          variant: 'warning',
        })
        // Используем исходные файлы
        setCompressedFiles(filesArray)
      } finally {
        setIsCompressing(false)
        setProgress({ current: 0, total: 0 })
      }
    },
    [alert, compressionOptions, showSuccessNotification, minSavingsPercentToNotify]
  )

  /**
   * Очищает сжатые файлы
   */
  const clearFiles = useCallback(() => {
    setCompressedFiles([])
    setProgress({ current: 0, total: 0 })
  }, [])

  return {
    isCompressing,
    compressedFiles,
    progress,
    handleFilesSelected,
    clearFiles,
  }
}
