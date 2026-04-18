import { GoogleGenAI } from "@google/genai";
import { ReportType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

export const aiService = {
  async generateReportText(data: any, type: ReportType, centreName: string = "EKET") {
    const prompt = `
      You are an official reporter for the Federal Road Safety Corps (FRSC) Nigeria.
      Generate a professional ${type.toUpperCase()} report for the Drivers License Centre (DLC) at ${centreName}.
      
      TONE: Official, formal government communication. Use clear English.
      STRUCTURE: Follow the structure shown in the official DLC reporting documents.
      
      REPORT DATA:
      ${JSON.stringify(data, null, 2)}
      
      INSTRUCTIONS:
      1. Include a formal header (e.g., FRSC/RS[Zone]/UC/DLC/VOL...).
      2. Address it to the Corps Marshal through hierarchy (Zonal, Sector, Unit Commander).
      3. Use sections like: 
         - BREAKDOWN OF FORMS RECEIVED
         - BREAKDOWN OF TEMPORARY DRIVERS' LICENSE PRINTED
         - SUMMARY BY CLASS
         - AGE GROUP AND SEX ANALYSIS
      4. Ensure all totals match the data provided.
      5. Output in clear Markdown.
      6. Use tables where appropriate.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a senior officer at FRSC Nigeria responsible for operational reporting. Your language is formal, precise, and follows government internal communication standards.",
          temperature: 0.2, // Low temperature for consistency
        }
      });

      return response.text;
    } catch (error) {
      console.error("AI Report Generation Error:", error);
      throw error;
    }
  }
};
