import { logger } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';
import { OCRService } from './ocr.service';

interface DocumentAIResult {
  text: string;
  entities: any[];
  pages: any[];
  confidence: number;
}

export class DocumentAIService {
  async processDocument(documentContent: Buffer): Promise<DocumentAIResult> {
    try {
      // Initialize Gemini API client
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              inlineData: {
                mimeType: 'application/pdf',
                data: documentContent.toString('base64')
              }
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        text: result.text || '',
        entities: result.entities || [],
        pages: result.pages || [],
        confidence: result.confidence || 0
      };
    } catch (error) {
      logger.error('Document AI processing error:', error);
      throw new AppError(500, 'Failed to process document with Gemini');
    }
  }

  async extractStructuredData(documentType: string, aiResult: DocumentAIResult) {
    // Here we can implement specific extraction logic based on document type
    const ocrService = new OCRService();
    
    switch (documentType) {
      case 'W2':
        return ocrService.extractW2Data(aiResult.text.split('\n'));
      case 'PAYSTUB':
        return ocrService.extractPaystubData(aiResult.text.split('\n'));
      case 'BANK_STATEMENT':
        return ocrService.extractBankStatementData(aiResult.text.split('\n'));
      default:
        return aiResult;
    }
  }
}

export const documentAIService = new DocumentAIService(); 