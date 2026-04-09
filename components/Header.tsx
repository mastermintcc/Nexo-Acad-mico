'use client'

import Logo from './Logo'
import Link from 'next/link'
import { Button } from './ui/button'
import { useAuth } from '@/hooks/useAuth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { User, LogOut, Shield, Clock } from 'lucide-react'
import AuthModal from './AuthModal'

export default function Header() {
  const { user, profile, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-bold hover:text-blue-600 transition-colors">Início</Link>
          <Link href="/analise" className="text-sm font-bold hover:text-blue-600 transition-colors">Análise</Link>
          <Link href="/paragfrase" className="text-sm font-bold hover:text-blue-600 transition-colors">P Paragfrase</Link>
          <Link href="/historico" className="text-sm font-bold hover:text-blue-600 transition-colors">Histórico</Link>
          {profile?.role === 'admin' && (
            <Link href="/crm" className="text-sm font-bold hover:text-blue-600 transition-colors">CRM</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold" />}>
                {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase() || 'U'}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-2 border-black shadow-xl">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-bold">{user.user_metadata?.full_name || 'Usuário'}</p>
                    <p className="text-xs text-black/60">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem render={<Link href="/historico" className="flex items-center gap-2 font-bold" />}>
                  <Clock size={16} />
                  Histórico
                </DropdownMenuItem>
                {profile?.role === 'admin' && (
                  <DropdownMenuItem render={<Link href="/crm" className="flex items-center gap-2 font-bold" />}>
                    <Shield size={16} />
                    CRM
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 font-bold flex items-center gap-2">
                  <LogOut size={16} />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <AuthModal 
                trigger={<Button variant="ghost" className="text-sm font-bold">Entrar</Button>} 
                defaultMode="login"
              />
              <AuthModal 
                trigger={
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full px-6">
                    Começar
                  </Button>
                } 
                defaultMode="signup"
              />
            </>
          )}
        </div>
      </div>
      {/* Faixa Freestyle em Degrade */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-black to-blue-600 opacity-80" />
    </header>
  )
}
