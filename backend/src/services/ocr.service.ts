import { Textract } from '@aws-sdk/client-textract';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';
import pool from '../db/connect';
import { documentAIService } from './document-ai.service';

interface W2Data {
  employerEIN: string;
  employerName: string;
  employeeSSN: string;
  employeeName: string;
  wagesAndTips: number;
  federalTaxWithheld: number;
  socialSecurityWages: number;
  medicareWages: number;
  stateWages: number;
  stateTaxWithheld: number;
  year: string;
}

interface PaystubData {
  employerName: string;
  employeeName: string;
  payPeriod: {
    startDate: string;
    endDate: string;
  };
  grossPay: number;
  netPay: number;
  ytdGrossPay: number;
  deductions: {
    type: string;
    amount: number;
    ytdAmount: number;
  }[];
}

interface BankStatementData {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  statementPeriod: {
    startDate: string;
    endDate: string;
  };
  beginningBalance: number;
  endingBalance: number;
  deposits: {
    date: string;
    amount: number;
    description: string;
  }[];
  withdrawals: {
    date: string;
    amount: number;
    description: string;
  }[];
}

export class OCRService {
  private textract: Textract;

  constructor() {
    this.textract = new Textract({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }

  async processDocument(documentId: string, bucketName: string, objectKey: string) {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE documents SET processing_status = $1 WHERE id = $2',
        ['processing', documentId]
      );

      // Get document content from S3
      const documentContent = await this.getDocumentFromS3(bucketName, objectKey);

      // Process with both services for comparison
      const [textractResult, geminiResult] = await Promise.all([
        this.processWithTextract(documentContent),
        documentAIService.processDocument(documentContent)
      ]);

      // Combine and validate results
      const combinedData = this.combineResults(textractResult, geminiResult);

      await client.query(
        `UPDATE documents 
         SET processing_status = $1, 
             ocr_data = $2,
             status = $3,
             confidence_score = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        ['completed', combinedData, 'processed', combinedData.confidence, documentId]
      );

      return combinedData;
    } catch (error) {
      logger.error('OCR processing error:', error);
      await client.query(
        `UPDATE documents 
         SET processing_status = $1,
             processing_errors = array_append(processing_errors, $2),
             status = $3
         WHERE id = $4`,
        ['failed', error.message, 'failed', documentId]
      );
      throw new AppError(500, 'OCR processing failed');
    } finally {
      client.release();
    }
  }

  private async combineResults(textractData: any, geminiData: any) {
    // Implement logic to compare and combine results
    // Use confidence scores to choose the best extraction
    return {
      ...this.selectBestResult(textractData, geminiData),
      confidence: this.calculateConfidence(textractData, geminiData),
      sources: {
        textract: textractData,
        gemini: geminiData
      }
    };
  }

  private selectBestResult(textractData: any, geminiData: any) {
    // Logic to select the best result based on confidence scores
    // and field completeness
    return geminiData.confidence > textractData.confidence 
      ? geminiData 
      : textractData;
  }

  private parseDocumentText(blocks: any[]): any {
    // Extract text blocks
    const textBlocks = blocks.filter(block => block.BlockType === 'LINE')
      .map(block => block.Text);

    // Basic document classification
    const documentType = this.classifyDocument(textBlocks);

    // Extract relevant data based on document type
    const extractedData = this.extractDataByType(textBlocks, documentType);

    return {
      documentType,
      extractedData,
      rawText: textBlocks
    };
  }

  private classifyDocument(textBlocks: string[]): string {
    const text = textBlocks.join(' ').toLowerCase();
    
    if (text.includes('w-2') || text.includes('wage') || text.includes('tax statement')) {
      return 'W2';
    }
    if (text.includes('pay') && (text.includes('stub') || text.includes('statement'))) {
      return 'PAYSTUB';
    }
    if (text.includes('bank') && text.includes('statement')) {
      return 'BANK_STATEMENT';
    }
    return 'UNKNOWN';
  }

  private extractDataByType(textBlocks: string[], documentType: string): any {
    switch (documentType) {
      case 'W2':
        return this.extractW2Data(textBlocks);
      case 'PAYSTUB':
        return this.extractPaystubData(textBlocks);
      case 'BANK_STATEMENT':
        return this.extractBankStatementData(textBlocks);
      default:
        return { rawText: textBlocks };
    }
  }

  private extractW2Data(textBlocks: string[]): W2Data {
    const text = textBlocks.join(' ');
    
    // Helper function to extract text using regex
    const extractText = (pattern: RegExp): string => {
      const match = text.match(pattern);
      return match ? match[1].trim() : '';
    };

    // Helper function to extract amount
    const extractAmount = (pattern: RegExp): number => {
      const match = text.match(pattern);
      return match ? parseFloat(match[1].replace(/[,$]/g, '')) : 0;
    };

    return {
      employerEIN: extractText(/Employer\s+ID[:\s]+([0-9-]+)/i),
      employerName: extractText(/Employer[:\s]+([^\n]+)/i),
      employeeSSN: extractText(/Employee\s+SSN[:\s]+([0-9-]+)/i),
      employeeName: extractText(/Employee[:\s]+([^\n]+)/i),
      wagesAndTips: extractAmount(/Wages[,\s]+tips[,\s]+other[:\s]+\$?([\d,.]+)/i),
      federalTaxWithheld: extractAmount(/Federal\s+tax\s+withheld[:\s]+\$?([\d,.]+)/i),
      socialSecurityWages: extractAmount(/Social\s+security\s+wages[:\s]+\$?([\d,.]+)/i),
      medicareWages: extractAmount(/Medicare\s+wages[:\s]+\$?([\d,.]+)/i),
      stateWages: extractAmount(/State\s+wages[:\s]+\$?([\d,.]+)/i),
      stateTaxWithheld: extractAmount(/State\s+tax\s+withheld[:\s]+\$?([\d,.]+)/i),
      year: extractText(/Tax\s+Year[:\s]+(\d{4})/i)
    };
  }

  private extractPaystubData(textBlocks: string[]): PaystubData {
    const text = textBlocks.join(' ');
    
    // Helper functions
    const extractText = (pattern: RegExp): string => {
      const match = text.match(pattern);
      return match ? match[1].trim() : '';
    };

    const extractAmount = (pattern: RegExp): number => {
      const match = text.match(pattern);
      return match ? parseFloat(match[1].replace(/[,$]/g, '')) : 0;
    };

    const extractDateRange = (pattern: RegExp): { startDate: string; endDate: string } => {
      const match = text.match(pattern);
      return match ? {
        startDate: match[1],
        endDate: match[2]
      } : { startDate: '', endDate: '' };
    };

    // Helper function to extract deductions
    const extractDeductions = (text: string): Array<{ type: string; amount: number; ytdAmount: number }> => {
      const deductions: Array<{ type: string; amount: number; ytdAmount: number }> = [];
      const deductionPattern = /(\w+(?:\s+\w+)*)\s+\$([\d,.]+)\s+\$([\d,.]+)/g;
      let match;

      while ((match = deductionPattern.exec(text)) !== null) {
        deductions.push({
          type: match[1].trim(),
          amount: parseFloat(match[2].replace(/[,$]/g, '')),
          ytdAmount: parseFloat(match[3].replace(/[,$]/g, ''))
        });
      }

      return deductions;
    };

    return {
      employerName: extractText(/Company[:\s]+([^\n]+)/i),
      employeeName: extractText(/Employee[:\s]+([^\n]+)/i),
      payPeriod: extractDateRange(/Pay Period[:\s]+(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/i),
      grossPay: extractAmount(/Gross Pay[:\s]+\$?([\d,.]+)/i),
      netPay: extractAmount(/Net Pay[:\s]+\$?([\d,.]+)/i),
      ytdGrossPay: extractAmount(/YTD Gross[:\s]+\$?([\d,.]+)/i),
      deductions: extractDeductions(text)
    };
  }

  private extractBankStatementData(textBlocks: string[]): BankStatementData {
    const text = textBlocks.join(' ');
    
    // Helper functions
    const extractText = (pattern: RegExp): string => {
      const match = text.match(pattern);
      return match ? match[1].trim() : '';
    };

    const extractAmount = (pattern: RegExp): number => {
      const match = text.match(pattern);
      return match ? parseFloat(match[1].replace(/[,$]/g, '')) : 0;
    };

    const extractDateRange = (pattern: RegExp): { startDate: string; endDate: string } => {
      const match = text.match(pattern);
      return match ? {
        startDate: match[1],
        endDate: match[2]
      } : { startDate: '', endDate: '' };
    };

    // Helper function to extract transactions
    const extractTransactions = (text: string, type: 'deposits' | 'withdrawals'): Array<{ date: string; amount: number; description: string }> => {
      const transactions: Array<{ date: string; amount: number; description: string }> = [];
      const pattern = type === 'deposits' 
        ? /(\d{2}\/\d{2})\s+([^$]+)\s+\$([\d,.]+)\s+CR/g
        : /(\d{2}\/\d{2})\s+([^$]+)\s+\$([\d,.]+)\s+DR/g;
      
      let match;
      while ((match = pattern.exec(text)) !== null) {
        transactions.push({
          date: match[1],
          description: match[2].trim(),
          amount: parseFloat(match[3].replace(/[,$]/g, ''))
        });
      }
      return transactions;
    };

    return {
      bankName: extractText(/(\w+(?:\s+\w+)*)\s+Bank Statement/i),
      accountHolder: extractText(/Account Holder[:\s]+([^\n]+)/i),
      accountNumber: extractText(/Account Number[:\s]+[*\s]*(\d{4})/i),
      statementPeriod: extractDateRange(/Statement Period[:\s]+(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/i),
      beginningBalance: extractAmount(/Beginning Balance[:\s]+\$?([\d,.]+)/i),
      endingBalance: extractAmount(/Ending Balance[:\s]+\$?([\d,.]+)/i),
      deposits: extractTransactions(text, 'deposits'),
      withdrawals: extractTransactions(text, 'withdrawals')
    };
  }
}

export const ocrService = new OCRService(); 