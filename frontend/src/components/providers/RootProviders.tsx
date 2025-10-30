'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { ConfirmDialogProvider } from '@/components/ui/alert-dialog-custom'

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
    </ThemeProvider>
  )
}
