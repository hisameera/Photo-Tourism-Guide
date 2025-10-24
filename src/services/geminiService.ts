import { GoogleGenAI, Modality } from "@google/genai";
import { AnalysisResult, GroundingSource } from "../types";

// Per coding guidelines, API key must come from process.env.API_KEY
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const analyzeImageAndFetchHistory = async (imageBase64: string): Promise<AnalysisResult> => {
  const imagePart = fileToGenerativePart(imageBase64, "image/jpeg");
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        imagePart,
        { text: "Identify the landmark in this image. First, state its name clearly on a single line. Then, provide a detailed history and interesting facts about it, suitable for a tourist. Be engaging and informative." }
      ]
    },
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text;
  
  const firstLineEnd = text.indexOf('\n');
  const landmarkName = firstLineEnd !== -1 ? text.substring(0, firstLineEnd).trim() : 'Unknown Landmark';
  const historyText = firstLineEnd !== -1 ? text.substring(firstLineEnd + 1).trim() : text;

  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => ({
      title: chunk.web?.title || 'Unknown Source',
      uri: chunk.web?.uri || '#',
    }))
    .filter((source: GroundingSource) => source.uri !== '#') || [];

  return { landmarkName, text: historyText, sources };
};

export const generateNarration = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read the following text in a clear, engaging, and friendly voice, as if you were a tour guide: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate audio narration.");
  }

  return base64Audio;
};
