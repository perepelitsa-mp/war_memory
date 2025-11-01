'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { ConfirmDialogProvider } from '@/components/ui/alert-dialog-custom'
import { AuthModalProvider } from '@/contexts/AuthModalContext'
import { AuthModal } from '@/components/auth/AuthModal'

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthModalProvider>
        <ConfirmDialogProvider>
          {children}
          <AuthModal />
        </ConfirmDialogProvider>
      </AuthModalProvider>
    </ThemeProvider>
  )
}
