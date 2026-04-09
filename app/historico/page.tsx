'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import FreestyleLines from '@/components/FreestyleLines'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Trash2, Loader2, Clock, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { jsPDF } from 'jspdf'
import Link from 'next/link'

export default function HistoricoPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const fetchAnalyses = async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching analyses:', error.message)
      } else {
        setAnalyses(data || [])
      }
      setLoading(false)
    }

    fetchAnalyses()

    // Realtime subscription
    const channel = supabase
      .channel('analyses-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'analyses',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchAnalyses()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const downloadPDF = (analysis: any) => {
    const doc = new jsPDF()
    const splitText = doc.splitTextToSize(analysis.result, 180)
    doc.setFontSize(16)
    doc.text(`Nexo Acadêmico - ${analysis.type === 'fichamento' ? 'Fichamento' : 'Resenha'}`, 10, 10)
    doc.setFontSize(10)
    doc.text(`Arquivo: ${analysis.file_name}`, 10, 18)
    doc.setFontSize(12)
    doc.text(splitText, 10, 30)
    doc.save(`${analysis.type}_${analysis.file_name}.pdf`)
  }

  const deleteAnalysis = async (id: string) => {
    if (confirm('Deseja excluir esta análise permanentemente?')) {
      try {
        const { error } = await supabase
          .from('analyses')
          .delete()
          .eq('id', id)
        if (error) throw error
      } catch (error) {
        console.error(error)
      }
    }
  }

  const filteredAnalyses = analyses.filter(a => 
    a.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="text-black/60 mb-6">Faça login para visualizar seu histórico.</p>
          <Link href="/">
            <Button className="bg-blue-600 text-white rounded-full px-8">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <FreestyleLines />
      <Header />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">HISTÓRICO</h1>
            <p className="text-black/60">Suas análises salvas na nuvem Nexo.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-4 h-4" />
            <input 
              type="text"
              placeholder="Buscar no histórico..." 
              className="w-full pl-10 pr-4 py-3 rounded-full border-2 border-black/10 focus:border-blue-600 outline-none transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : filteredAnalyses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAnalyses.map((analysis) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="border-2 border-black rounded-3xl overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
                    <CardHeader className="bg-black text-white p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          analysis.type === 'fichamento' ? 'bg-blue-600' : 'bg-white text-black'
                        }`}>
                          {analysis.type}
                        </span>
                        <button 
                          onClick={() => deleteAnalysis(analysis.id)}
                          className="text-white/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <CardTitle className="text-lg font-bold line-clamp-1">{analysis.file_name}</CardTitle>
                      <CardDescription className="text-white/60 flex items-center gap-1 text-xs">
                        <Clock size={12} />
                        {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-grow flex flex-col justify-between">
                      <p className="text-sm text-black/60 line-clamp-4 mb-6 italic">
                        &quot;{analysis.result.substring(0, 200)}...&quot;
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => downloadPDF(analysis)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs"
                        >
                          <Download size={14} className="mr-2" />
                          PDF
                        </Button>
                        <Link href={`/analise?id=${analysis.id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-2 border-black rounded-xl font-bold text-xs">
                            Ver Mais
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
            <FileText size={48} className="mx-auto text-black/20 mb-4" />
            <h3 className="text-xl font-bold">Nenhuma análise encontrada</h3>
            <p className="text-black/40 mb-8">Comece enviando um documento na página de análise.</p>
            <Link href="/analise">
              <Button className="bg-blue-600 text-white rounded-full px-8 font-bold">Nova Análise</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
