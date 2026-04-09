'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import FreestyleLines from '@/components/FreestyleLines'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Copy, Check, ArrowLeft, Sparkles, RefreshCw, Type } from 'lucide-react'
import { paraphraseText } from '@/lib/gemini'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import Logo from '@/components/Logo'

export default function ParagfrasePage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [tone, setTone] = useState<'formal' | 'academico' | 'simples' | 'criativo'>('academico')
  const [intensity, setIntensity] = useState<'leve' | 'moderada' | 'profunda'>('moderada')
  const [copied, setCopied] = useState(false)
  const { user } = useAuth()

  const handleParaphrase = async () => {
    if (!text.trim()) return
    if (text.length > 5000) {
      alert('O texto excede o limite de 5000 caracteres.')
      return
    }
    if (!user) {
      alert('Você precisa estar logado para usar o P Paragfrase.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const paraphrased = await paraphraseText(text, tone, intensity)
      
      if (!paraphrased) {
        throw new Error("A IA não retornou nenhum resultado. Tente novamente.")
      }

      setResult(paraphrased)

      // Opcional: Salvar no banco de dados se desejar histórico de paráfrases
      /*
      await supabase.from('paraphrases').insert({
        user_id: user.id,
        original_text: text,
        paraphrased_text: paraphrased,
        tone,
        intensity
      })
      */

    } catch (error: any) {
      console.error('Erro na paráfrase:', error)
      alert(`Erro: ${error.message || 'Ocorreu um erro inesperado.'}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900">
      <FreestyleLines />
      <Header />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-black/60 hover:text-blue-600 font-bold transition-colors">
            <ArrowLeft size={20} />
            Voltar para o Início
          </Link>
        </div>

        <section className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
          >
            <Sparkles size={14} />
            Novo Módulo
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
          >
            P <span className="text-blue-600">Paragfrase</span>
          </motion.h1>
          <p className="text-black/60">Reescreva e aperfeiçoe seus textos com inteligência artificial.</p>
        </section>

        <section className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Coluna de Entrada */}
          <Card className="border-2 border-black shadow-xl rounded-3xl overflow-hidden h-fit">
            <CardHeader className="bg-black text-white p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Type size={20} />
                Texto Original
              </CardTitle>
              <CardDescription className="text-white/60">Insira até 5000 caracteres</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Cole seu texto aqui..."
                  className="w-full h-64 p-4 rounded-2xl border-2 border-black/10 focus:border-blue-600 outline-none transition-all resize-none font-medium"
                  maxLength={5000}
                />
                <div className="absolute bottom-4 right-4 text-xs font-bold text-black/20">
                  {text.length}/5000
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black/40">Tom da Escrita</label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full p-3 rounded-xl border-2 border-black/10 focus:border-blue-600 outline-none font-bold bg-white"
                  >
                    <option value="academico">Acadêmico</option>
                    <option value="formal">Formal</option>
                    <option value="simples">Simples</option>
                    <option value="criativo">Criativo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black/40">Intensidade</label>
                  <select 
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as any)}
                    className="w-full p-3 rounded-xl border-2 border-black/10 focus:border-blue-600 outline-none font-bold bg-white"
                  >
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="profunda">Profunda</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleParaphrase}
                disabled={!text.trim() || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 text-lg font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Reescrevendo...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Parafrasear Agora
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Coluna de Resultado */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-2 border-blue-600 shadow-2xl rounded-3xl overflow-hidden bg-blue-50/30 min-h-[400px]">
                    <CardHeader className="bg-blue-600 text-white p-6 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold">Texto Parafraseado</CardTitle>
                        <CardDescription className="text-white/80">Resultado otimizado pela Nexo AI</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={copyToClipboard}
                        className="text-white hover:bg-white/20 rounded-full"
                      >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="prose prose-blue max-w-none text-lg leading-relaxed text-black/80">
                        <ReactMarkdown>{result}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] border-2 border-dashed border-black/10 rounded-[40px] flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6 text-black/20">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-black/40">Aguardando seu texto</h3>
                  <p className="text-black/20 max-w-xs mx-auto mt-2">
                    Insira o texto original ao lado e escolha as opções para ver a mágica acontecer.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 py-12 mt-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo />
          <p className="text-sm text-black/40">© 2026 Nexo Acadêmico. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
