'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import FreestyleLines from '@/components/FreestyleLines'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, Loader2, Download, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react'
import { analyzeAcademicWork } from '@/lib/gemini'
import { jsPDF } from 'jspdf'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import mammoth from 'mammoth'
import Logo from '@/components/Logo'
import Link from 'next/link'
import AuthModal from '@/components/AuthModal'

export default function HomePage() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900">
      <FreestyleLines />
      <Header />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black uppercase tracking-widest bg-blue-600 text-white rounded-full">
              Inteligência Artificial Acadêmica
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              Sua <span className="text-blue-600">Excelência</span> <br />
              Acadêmica Começa Aqui.
            </h1>
            <p className="text-xl md:text-2xl text-black/60 max-w-2xl mx-auto mb-12 font-medium">
              A Nexo Acadêmico combina tecnologia de ponta com rigor científico para transformar a forma como você estuda e produz conhecimento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analise">
                <Button className="w-full sm:w-auto bg-black hover:bg-black/90 text-white rounded-full px-10 py-8 text-xl font-bold shadow-2xl transition-transform hover:scale-105">
                  Começar Agora
                </Button>
              </Link>
              <AuthModal 
                trigger={
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto border-2 border-black rounded-full px-10 py-8 text-xl font-bold hover:bg-black hover:text-white transition-all"
                  >
                    Fazer Login
                  </Button>
                }
                defaultMode="login"
              />
            </div>
          </motion.div>
        </section>

        {/* Contextualization Section */}
        <section className="bg-black text-white py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">
                  O que é o <br />
                  <span className="text-blue-500">Nexo Acadêmico?</span>
                </h2>
                <div className="space-y-6 text-lg text-white/70">
                  <p>
                    Somos uma plataforma de assessoria em escrita acadêmica que utiliza modelos avançados de IA para auxiliar estudantes, pesquisadores e professores na síntese e análise de textos complexos.
                  </p>
                  <p>
                    Nossa missão é democratizar o acesso a ferramentas de alta performance, garantindo que o tempo gasto na leitura e estruturação de trabalhos seja otimizado, permitindo que você foque no que realmente importa: a sua contribuição intelectual.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <h3 className="text-3xl font-bold text-blue-500 mb-2">98%</h3>
                  <p className="text-sm text-white/60 font-bold uppercase tracking-wider">Precisão em Citações</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <h3 className="text-3xl font-bold text-blue-500 mb-2">10x</h3>
                  <p className="text-sm text-white/60 font-bold uppercase tracking-wider">Mais Rapidez</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <h3 className="text-3xl font-bold text-blue-500 mb-2">PDF/DOCX</h3>
                  <p className="text-sm text-white/60 font-bold uppercase tracking-wider">Suporte Total</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <h3 className="text-3xl font-bold text-blue-500 mb-2">OCR</h3>
                  <p className="text-sm text-white/60 font-bold uppercase tracking-wider">Leitura de Imagens</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Nossos Serviços</h2>
              <p className="text-black/60 max-w-xl mx-auto">Funcionalidades desenhadas para elevar o nível da sua produção acadêmica.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-2 border-black rounded-[40px] p-8 hover:shadow-2xl transition-all group">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-transform">
                  <FileText size={32} />
                </div>
                <h3 className="text-3xl font-black mb-4">Fichamento Automático</h3>
                <p className="text-black/60 text-lg mb-6">
                  Extraímos as principais teses, conceitos e citações diretas do seu texto, organizando-os de forma lógica e pronta para uso em suas referências.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-blue-600" /> Citações Diretas
                  </li>
                  <li className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-blue-600" /> Estrutura Lógica
                  </li>
                  <li className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-blue-600" /> Exportação em PDF
                  </li>
                </ul>
                <Link href="/analise" className="mt-8 block">
                  <Button className="w-full bg-black text-white rounded-xl font-bold">Acessar</Button>
                </Link>
              </Card>

              <Card className="border-2 border-black rounded-[40px] p-8 hover:shadow-2xl transition-all group">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-8 group-hover:-rotate-6 transition-transform">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-3xl font-black mb-4">Resenha Crítica</h3>
                <p className="text-black/60 text-lg mb-6">
                  Uma análise profunda que identifica o contexto, a problemática, os objetivos, a metodologia e os resultados do estudo original.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-black" /> Análise de Metodologia
                  </li>
                  <li className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-black" /> Contextualização
                  </li>
                  <li className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-black" /> Síntese de Resultados
                  </li>
                </ul>
                <Link href="/analise" className="mt-8 block">
                  <Button className="w-full bg-black text-white rounded-xl font-bold">Acessar</Button>
                </Link>
              </Card>

              <Card className="border-2 border-blue-600 rounded-[40px] p-8 hover:shadow-2xl transition-all group bg-blue-50/30 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Novo</span>
                </div>
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                  <RefreshCw size={32} />
                </div>
                <h3 className="text-3xl font-black mb-4">P Paragfrase</h3>
                <p className="text-black/60 text-lg mb-6">
                  Reescreva e aperfeiçoe seus textos com IA. Melhore a fluidez e evite plágio com paráfrases inteligentes e personalizadas.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 font-bold text-sm text-blue-600">
                    <Sparkles size={18} /> Tons Personalizados
                  </li>
                  <li className="flex items-center gap-2 font-bold text-sm text-blue-600">
                    <Sparkles size={18} /> Até 5000 Caracteres
                  </li>
                  <li className="flex items-center gap-2 font-bold text-sm text-blue-600">
                    <Sparkles size={18} /> Sem Cópias Literais
                  </li>
                </ul>
                <Link href="/paragfrase" className="mt-8 block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20">Acessar P Paragfrase</Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="bg-blue-600 rounded-[60px] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 relative z-10">
              Pronto para elevar seu <br /> nível acadêmico?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <AuthModal 
                trigger={
                  <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-12 py-8 text-xl font-bold shadow-2xl">
                    Começar Grátis
                  </Button>
                }
                defaultMode="signup"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo />
          <p className="text-sm text-black/40 font-bold">© 2026 Nexo Acadêmico. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <Link href="/analise" className="text-sm font-bold hover:text-blue-600 transition-colors">Análise</Link>
            <Link href="/paragfrase" className="text-sm font-bold hover:text-blue-600 transition-colors">P Paragfrase</Link>
            {profile?.role === 'admin' && (
              <Link href="/crm" className="text-sm font-bold hover:text-blue-600 transition-colors">CRM</Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
