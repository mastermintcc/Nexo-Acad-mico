'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import FreestyleLines from '@/components/FreestyleLines'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, Loader2, Download, CheckCircle2, ArrowLeft } from 'lucide-react'
import { analyzeAcademicWork } from '@/lib/gemini'
import { jsPDF } from 'jspdf'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import mammoth from 'mammoth'
import Logo from '@/components/Logo'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default function AnalisePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<'fichamento' | 'resenha'>('fichamento')
  const [quotesCount, setQuotesCount] = useState(5)
  const { user } = useAuth()

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  })

  const handleAnalyze = async () => {
    if (!file) return
    if (!user) {
      alert('Você precisa estar logado para realizar uma análise.')
      return
    }
    setLoading(true)
    setResult(null)

    try {
      // 1. Upload do arquivo para o Supabase Storage (Bucket: Caixadetalha)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Caixadetalha')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Erro no upload:', uploadError.message)
      }

      let contentBase64 = ''
      let mimeType = file.type

      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer()
        const { value: text } = await mammoth.extractRawText({ arrayBuffer })
        contentBase64 = btoa(unescape(encodeURIComponent(text)))
        mimeType = 'text/plain'
      } else {
        // Melhor forma de converter para base64 no navegador
        contentBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      const analysis = await analyzeAcademicWork(contentBase64, mimeType, analysisType, quotesCount)
      
      if (!analysis) {
        throw new Error("A IA não retornou nenhum resultado. Tente novamente.")
      }

      setResult(analysis)

      const { error: dbError } = await supabase.from('analyses').insert({
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        result: analysis,
        type: analysisType,
        file_path: uploadData?.path || null
      })
      
      if (dbError) console.error('Error saving analysis:', dbError.message)

    } catch (error: any) {
      console.error('Erro na análise:', error)
      alert(`Erro: ${error.message || 'Ocorreu um erro inesperado durante a análise.'}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!result) return
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxLineWidth = pageWidth - (margin * 2)
    
    doc.setFontSize(18)
    doc.setTextColor(37, 99, 235) // Blue-600
    doc.text(`Nexo Acadêmico - ${analysisType === 'fichamento' ? 'Fichamento' : 'Resenha'}`, margin, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Arquivo: ${file?.name}`, margin, 28)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, 33)
    
    doc.setDrawColor(0, 0, 0)
    doc.line(margin, 38, pageWidth - margin, 38)
    
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    
    // Split text into lines that fit the page width
    const splitText = doc.splitTextToSize(result, maxLineWidth)
    
    let cursorY = 48
    const pageHeight = doc.internal.pageSize.getHeight()
    
    splitText.forEach((line: string) => {
      if (cursorY > pageHeight - margin) {
        doc.addPage()
        cursorY = margin
      }
      doc.text(line, margin, cursorY)
      cursorY += 7
    })
    
    doc.save(`${analysisType}_${file?.name || 'analise'}.pdf`)
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
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
          >
            Ferramenta de <span className="text-blue-600">Análise</span>
          </motion.h1>
          <p className="text-black/60">Gere fichamentos e resenhas com precisão acadêmica.</p>
        </section>

        <section className="max-w-3xl mx-auto">
          <Card className="border-2 border-black shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-black text-white p-8">
              <CardTitle className="text-2xl font-bold">Upload de Documento</CardTitle>
              <CardDescription className="text-white/60">Envie seu PDF ou DOCX para começar a análise</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                    isDragActive ? 'border-blue-600 bg-blue-50' : 'border-black/10 hover:border-blue-600 hover:bg-black/[0.02]'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                      <Upload size={32} />
                    </div>
                    {file ? (
                      <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <FileText size={20} />
                        <span>{file.name}</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-bold">Arraste seu arquivo aqui</p>
                        <p className="text-sm text-black/40">PDF ou DOCX até 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
                  <div className="flex flex-col gap-4 w-full md:w-auto">
                    <Tabs defaultValue="fichamento" className="w-full md:w-auto" onValueChange={(v) => setAnalysisType(v as any)}>
                      <TabsList className="bg-black/5 p-1 rounded-full">
                        <TabsTrigger value="fichamento" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Fichamento</TabsTrigger>
                        <TabsTrigger value="resenha" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Resenha</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {analysisType === 'fichamento' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-col gap-2"
                      >
                        <label className="text-xs font-bold uppercase tracking-widest text-black/40">Quantidade de Citações</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={quotesCount} 
                            onChange={(e) => setQuotesCount(parseInt(e.target.value))}
                            className="w-32 accent-blue-600"
                          />
                          <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                            {quotesCount}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!file || loading}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-lg font-bold shadow-xl shadow-blue-600/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Iniciar Análise'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <AnimatePresence>
          {result && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="max-w-4xl mx-auto mt-12"
            >
              <Card className="border-2 border-black shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b p-8">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="text-green-500" />
                      Resultado Final
                    </CardTitle>
                    <CardDescription>Gerado por Nexo AI</CardDescription>
                  </div>
                  <Button variant="outline" onClick={downloadPDF} className="rounded-full border-2 border-black font-bold">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-blue max-w-none text-lg leading-relaxed text-black/80">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>
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
