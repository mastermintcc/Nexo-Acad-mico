'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.'
      try {
        const parsed = JSON.parse(this.state.error?.message || '{}')
        if (parsed.error) {
          errorMessage = `Erro no Firestore: ${parsed.error} (${parsed.operationType} em ${parsed.path})`
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
          <Card className="max-w-md w-full border-2 border-black shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-black text-white p-6">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-orange-500" />
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center space-y-6">
              <p className="text-black/60 font-medium">{errorMessage}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 font-bold"
              >
                Recarregar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
