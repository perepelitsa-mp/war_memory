'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

interface ConfirmDialogOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

interface AlertDialogOptions {
  title: string
  description: string
  confirmText?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
  alert: (options: AlertDialogOptions) => Promise<void>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmDialogOptions | AlertDialogOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)
  const [isAlertMode, setIsAlertMode] = useState(false)

  const confirm = (opts: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setIsAlertMode(false)
      setResolvePromise(() => resolve)
      setOpen(true)
    })
  }

  const alert = (opts: AlertDialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      setOptions({ ...opts, cancelText: undefined })
      setIsAlertMode(true)
      setResolvePromise(() => () => {
        resolve()
        return true
      })
      setOpen(true)
    })
  }

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true)
    }
    setOpen(false)
    setResolvePromise(null)
  }

  const handleCancel = () => {
    if (resolvePromise && !isAlertMode) {
      resolvePromise(false)
    }
    setOpen(false)
    setResolvePromise(null)
  }

  const confirmOpts = options as ConfirmDialogOptions
  const alertOpts = options as AlertDialogOptions

  // Определяем иконку и цвета в зависимости от варианта alert
  const getAlertVariantConfig = () => {
    if (!isAlertMode || !alertOpts.variant) {
      return null
    }

    switch (alertOpts.variant) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconClassName: 'text-green-500',
          bgClassName: 'bg-green-500/10',
          buttonClassName: 'bg-green-600 hover:bg-green-700 text-white',
        }
      case 'error':
        return {
          icon: XCircle,
          iconClassName: 'text-red-500',
          bgClassName: 'bg-red-500/10',
          buttonClassName: 'bg-red-600 hover:bg-red-700 text-white',
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          iconClassName: 'text-orange-500',
          bgClassName: 'bg-orange-500/10',
          buttonClassName: 'bg-orange-600 hover:bg-orange-700 text-white',
        }
      case 'info':
        return {
          icon: Info,
          iconClassName: 'text-blue-500',
          bgClassName: 'bg-blue-500/10',
          buttonClassName: 'bg-blue-600 hover:bg-blue-700 text-white',
        }
      default:
        return null
    }
  }

  const alertVariantConfig = getAlertVariantConfig()

  return (
    <ConfirmDialogContext.Provider value={{ confirm, alert }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="sm:max-w-md">
          {isAlertMode && alertVariantConfig ? (
            <>
              {/* Alert mode с иконкой и красивым оформлением */}
              <div className="flex flex-col items-center gap-4 py-4">
                {/* Иконка с фоном */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${alertVariantConfig.bgClassName}`}
                >
                  <alertVariantConfig.icon
                    className={`h-8 w-8 ${alertVariantConfig.iconClassName}`}
                  />
                </div>

                {/* Заголовок */}
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-semibold">{options?.title}</h2>
                  <p className="text-sm text-muted-foreground">{options?.description}</p>
                </div>

                {/* Кнопка */}
                <AlertDialogAction
                  onClick={handleConfirm}
                  className={`w-full ${alertVariantConfig.buttonClassName}`}
                >
                  {options?.confirmText || 'OK'}
                </AlertDialogAction>
              </div>
            </>
          ) : (
            <>
              {/* Обычный Confirm Dialog */}
              <AlertDialogHeader>
                <AlertDialogTitle>{options?.title}</AlertDialogTitle>
                <AlertDialogDescription>{options?.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                {!isAlertMode && (
                  <AlertDialogCancel onClick={handleCancel}>
                    {confirmOpts?.cancelText || 'Отмена'}
                  </AlertDialogCancel>
                )}
                <AlertDialogAction
                  onClick={handleConfirm}
                  className={
                    confirmOpts?.variant === 'destructive'
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : ''
                  }
                >
                  {options?.confirmText || 'OK'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider')
  }
  return context
}
