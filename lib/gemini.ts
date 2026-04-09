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

export async function analyzeAcademicWork(
  fileBase64: string, 
  mimeType: string, 
  type: 'fichamento' | 'resenha',
  quotesCount: number = 5
) {
  const ai = getAiClient();
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `Você é um assistente acadêmico de alta precisão especializado em normas ABNT. 
Sua tarefa é analisar documentos acadêmicos e gerar fichamentos ou resenhas críticas.
Sempre utilize citações diretas no formato ABNT: "Citação" (Autor, Ano, p. Página).
Seja extremamente rigoroso com a veracidade das informações e a formatação acadêmica.`;

  const prompt = type === 'fichamento' 
    ? `Analise este documento acadêmico e gere um FICHAMENTO completo em Português. 
O fichamento deve conter:
1. Referência Bibliográfica Completa (conforme ABNT).
2. Resumo dos principais argumentos.
3. Extração de EXATAMENTE ${quotesCount} citações diretas relevantes, cada uma acompanhada de sua referência (Autor, Ano, p. Página).
4. Análise crítica sucinta dos conceitos fundamentais.`
    : `Analise este documento acadêmico e gere uma RESENHA CRÍTICA completa em Português. 
A resenha deve conter:
1. Referência Bibliográfica Completa (conforme ABNT).
2. Apresentação da obra (Autor, contexto).
3. Resumo da obra (Problemática, Objetivo, Metodologia e Resultados).
4. Análise Crítica (Contribuições e limitações).
5. Conclusão.
Utilize citações diretas pontuais para embasar a análise, sempre no formato (Autor, Ano, p. Página).`;

  const filePart = {
    inlineData: {
      data: fileBase64,
      mimeType: mimeType,
    },
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [filePart, { text: prompt }] },
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2, // Lower temperature for higher precision
    }
  });

  return response.text;
}

export async function paraphraseText(
  text: string,
  tone: 'formal' | 'academico' | 'simples' | 'criativo',
  intensity: 'leve' | 'moderada' | 'profunda'
) {
  const ai = getAiClient();
  const model = "gemini-3.1-pro-preview";

  const systemInstruction = `Você é um especialista em escrita e paráfrase acadêmica/profissional. 
Sua tarefa é reescrever o texto fornecido pelo usuário, melhorando a fluidez, clareza e vocabulário, sem perder o sentido original e garantindo que não haja plágio.`;

  const toneDescriptions = {
    formal: "um tom formal e profissional, adequado para comunicações executivas",
    academico: "um tom estritamente acadêmico, seguindo normas de escrita científica e vocabulário erudito",
    simples: "um tom simples e direto, facilitando a compreensão para qualquer público",
    criativo: "um tom criativo e envolvente, com vocabulário variado e construções dinâmicas"
  };

  const intensityDescriptions = {
    leve: "faça apenas ajustes pontuais de gramática e fluidez",
    moderada: "reescreva sentenças inteiras para melhorar o ritmo e a clareza",
    profunda: "reestruture completamente o texto, mantendo apenas a ideia central, mas com palavras e ordens totalmente novas"
  };

  const prompt = `Por favor, parafraseie o seguinte texto:
"${text}"

Instruções específicas:
- Utilize ${toneDescriptions[tone]}.
- A intensidade da mudança deve ser ${intensityDescriptions[intensity]}.
- O resultado deve ser um texto novo, original e sem cópias literais do original.
- Mantenha o idioma original do texto (Português).`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ text: prompt }],
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7, // Slightly higher for creativity in paraphrasing
    }
  });

  return response.text;
}
