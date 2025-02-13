import { z } from 'zod';

// Schema for running AI analysis
export const runAnalysisSchema = z.object({
  body: z.object({
    forceReanalysis: z.boolean().optional(),
    includeDocumentAnalysis: z.boolean().optional(),
    options: z.object({
      confidenceThreshold: z.number().min(0).max(1).optional(),
      includeExplanations: z.boolean().optional(),
      riskFactors: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
});

// Schema for comparing analyses
export const compareAnalysesSchema = z.object({
  query: z.object({
    version1: z.string().min(1),
    version2: z.string().min(1),
    includeDetails: z.boolean().optional(),
  }),
});

// Schema for getting AI analytics
export const getAIAnalyticsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    groupBy: z.enum(['day', 'week', 'month']).optional(),
    version: z.string().optional(),
    riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  }).optional(),
});

// Schema for getting analysis history
export const getAnalysisHistorySchema = z.object({
  query: z.object({
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().min(0).optional(),
    sortBy: z.enum(['timestamp', 'risk_score', 'confidence']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    version: z.string().optional(),
  }).optional(),
}); 