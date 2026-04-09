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
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import mammoth from 'mammoth'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function AnalisePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<'fichamento' | 'resenha'>('fichamento')
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
    setLoading(true)
    setResult(null)

    try {
      let contentBase64 = ''
      let mimeType = file.type

      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer()
        const { value: text } = await mammoth.extractRawText({ arrayBuffer })
        contentBase64 = btoa(unescape(encodeURIComponent(text)))
        mimeType = 'text/plain'
      } else {
        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        contentBase64 = btoa(binary)
      }

      const analysis = await analyzeAcademicWork(contentBase64, mimeType, analysisType)
      const finalResult = analysis || "Não foi possível gerar a análise."
      setResult(finalResult)

      if (user) {
        await addDoc(collection(db, 'analyses'), {
          userId: user.uid,
          fileName: file.name,
          fileType: file.type,
          result: finalResult,
          type: analysisType,
          createdAt: serverTimestamp()
        })
      }

      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!result) return
    const doc = new jsPDF()
    const splitText = doc.splitTextToSize(result, 180)
    doc.setFontSize(16)
    doc.text(`Nexo Acadêmico - ${analysisType === 'fichamento' ? 'Fichamento' : 'Resenha'}`, 10, 10)
    doc.setFontSize(10)
    doc.text(`Arquivo: ${file?.name}`, 10, 18)
    doc.setFontSize(12)
    doc.text(splitText, 10, 30)
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

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <Tabs defaultValue="fichamento" className="w-full md:w-auto" onValueChange={(v) => setAnalysisType(v as any)}>
                    <TabsList className="bg-black/5 p-1 rounded-full">
                      <TabsTrigger value="fichamento" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Fichamento</TabsTrigger>
                      <TabsTrigger value="resenha" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Resenha</TabsTrigger>
                    </TabsList>
                  </Tabs>

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
                  <div className="prose prose-blue max-w-none whitespace-pre-wrap text-lg leading-relaxed text-black/80">
                    {result}
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
