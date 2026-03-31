
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Attachment } from "../types";

export const analyzeSingleForm = async (attachment: Attachment) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const parts: any[] = [];
  
  // Combine extracted text from documents
  let contentText = `Student Submission Analysis for File: ${attachment.file.name}\n\n`;
  if (attachment.extractedText) {
    const isHtml = attachment.extractedText.includes('<table') || attachment.extractedText.includes('<p');
    contentText += `--- EXTRACTED FROM DOCUMENT (${isHtml ? 'HTML STRUCTURED' : 'PLAIN TEXT'}) ---\n${attachment.extractedText}\n\n`;
  }
  
  parts.push({ text: contentText });

  // Add PDF or Image files for visual/structural analysis
  const supportedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ];

  if (supportedMimeTypes.includes(attachment.mimeType) || attachment.mimeType.startsWith('image/')) {
    parts.push({
      inlineData: {
        mimeType: attachment.mimeType,
        data: attachment.base64.split(',')[1]
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 8192 },
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error for " + attachment.file.name, error);
    throw error;
  }
};
