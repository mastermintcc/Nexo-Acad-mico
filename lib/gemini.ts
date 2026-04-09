'use client'

import { GoogleGenAI } from "@google/genai";

let aiClient: any = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('A chave de API do Gemini (NEXT_PUBLIC_GEMINI_API_KEY) não foi configurada nas variáveis de ambiente.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function analyzeAcademicWork(fileBase64: string, mimeType: string, type: 'fichamento' | 'resenha') {
  const ai = getAiClient();
  const model = "gemini-3-flash-preview";
  
  const prompt = type === 'fichamento' 
    ? "Analise este documento acadêmico e gere um fichamento completo em Português. Inclua as principais citações diretas do texto, organizadas por temas ou capítulos. Destaque os conceitos fundamentais."
    : "Analise este documento acadêmico e gere uma resenha crítica completa em Português. Inclua: Contexto, Problemática, Objetivo, Metodologia e Resultados. Seja analítico e siga as normas acadêmicas.";

  const filePart = {
    inlineData: {
      data: fileBase64,
      mimeType: mimeType,
    },
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [filePart, { text: prompt }] },
  });

  return response.text;
}
