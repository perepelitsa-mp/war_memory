'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { useRouter } from 'next/navigation'

export function AuthModal() {
  const { isOpen, closeAuthModal } = useAuthModal()
  const router = useRouter()

  const handleSuccess = () => {
    closeAuthModal()
    router.refresh()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Книга Памяти Кавалерово
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <RegisterForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
