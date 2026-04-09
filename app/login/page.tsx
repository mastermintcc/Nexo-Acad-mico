'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import FreestyleLines from '@/components/FreestyleLines'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <FreestyleLines />
      <Header />

      <main className="container mx-auto px-4 py-24 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-black shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-black text-white p-8 text-center">
              <CardTitle className="text-3xl font-black tracking-tighter">BEM-VINDO</CardTitle>
              <CardDescription className="text-white/60">Acesse sua conta Nexo Acadêmico</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider">E-mail</label>
                <Input 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="rounded-xl border-2 border-black/10 focus:border-blue-600 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider">Senha</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="rounded-xl border-2 border-black/10 focus:border-blue-600 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 text-lg font-bold shadow-xl shadow-blue-600/20">
                Entrar
              </Button>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-black/60">
                  Não tem uma conta? <Link href="#" className="text-blue-600 font-bold hover:underline">Cadastre-se</Link>
                </p>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-black/10"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-black/40">Ou continue com</span></div>
                </div>
                <Button variant="outline" className="w-full rounded-full h-12 border-2 border-black font-bold">
                  Google
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
