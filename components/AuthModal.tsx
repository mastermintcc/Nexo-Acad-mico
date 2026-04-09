'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Mail, Lock, User, Chrome } from 'lucide-react'

interface AuthModalProps {
  trigger?: React.ReactNode
  defaultMode?: 'login' | 'signup'
}

export default function AuthModal({ trigger, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  
  const { login, loginWithEmail, signUpWithEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'login') {
        const { error } = await loginWithEmail(email, password)
        if (error) throw error
      } else {
        const { error } = await signUpWithEmail(email, password, name)
        if (error) throw error
        // Supabase might require email confirmation, but for now we assume it works
        setMode('login')
        setError('Conta criada! Verifique seu e-mail ou faça login.')
        return
      }
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await login()
      // The page will redirect, so we don't need to close the modal manually
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Entrar</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-2 border-black p-0 overflow-hidden">
        <div className="bg-black p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {mode === 'login' ? 'BEM-VINDO DE VOLTA' : 'CRIAR CONTA'}
            </DialogTitle>
            <p className="text-white/60 text-sm">
              {mode === 'login' 
                ? 'Acesse sua conta Nexo Acadêmico' 
                : 'Junte-se à revolução da escrita acadêmica'}
            </p>
          </DialogHeader>
        </div>

        <div className="p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-xs uppercase tracking-widest">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                  <Input 
                    id="name" 
                    placeholder="Seu nome" 
                    className="pl-10 rounded-xl border-2 border-black/10 focus:border-blue-600"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-10 rounded-xl border-2 border-black/10 focus:border-blue-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 rounded-xl border-2 border-black/10 focus:border-blue-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-6"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Entrar' : 'Cadastrar')}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-black/40 font-bold">Ou continue com</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-2 border-black rounded-xl font-bold py-6 flex items-center gap-2"
            onClick={handleGoogleLogin}
          >
            <Chrome className="w-5 h-5" />
            Google
          </Button>

          <p className="mt-8 text-center text-sm text-black/60">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="ml-1 text-blue-600 font-bold hover:underline"
            >
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
