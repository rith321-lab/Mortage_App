import { AppDataSource } from '../config/database';
import { MortgageApplication } from '../entities/MortgageApplication';
import { Document } from '../entities/Document';
import { AppError } from '../utils/AppError';
import { OpenAI } from 'openai';

export class AIAnalysisService {
  private openai: OpenAI;
  private applicationRepository = AppDataSource.getRepository(MortgageApplication);
  private documentRepository = AppDataSource.getRepository(Document);

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeApplication(applicationId: string): Promise<any> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: [
        'user',
        'property',
        'loanDetails',
        'borrowerDetails',
        'documents'
      ]
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Analyze application data
    const analysisResults = await this.performAnalysis(application);

    // Update application with analysis results
    application.aiAnalysisResults = analysisResults;
    await this.applicationRepository.save(application);

    return analysisResults;
  }

  private async performAnalysis(application: MortgageApplication) {
    // Prepare data for analysis
    const applicationData = {
      property: application.property,
      loanDetails: application.loanDetails,
      borrowerDetails: application.borrowerDetails,
      documents: application.documents
    };

    // Calculate risk factors
    const riskFactors = await this.calculateRiskFactors(applicationData);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(riskFactors);

    // Analyze documents
    const documentAnalysis = await this.analyzeDocuments(application.documents);

    return {
      riskScore: this.calculateRiskScore(riskFactors),
      riskFactors,
      recommendations,
      documentAnalysis,
      confidence: this.calculateConfidence(riskFactors, documentAnalysis),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }

  private async calculateRiskFactors(applicationData: any) {
    const riskFactors = [];

    // DTI (Debt-to-Income) Ratio
    const monthlyIncome = applicationData.borrowerDetails.monthlyIncome;
    const monthlyDebt = applicationData.borrowerDetails.monthlyDebtPayments;
    const dti = (monthlyDebt / monthlyIncome) * 100;
    riskFactors.push({
      name: 'DTI Ratio',
      value: dti,
      impact: dti > 43 ? 'high' : dti > 36 ? 'medium' : 'low',
      explanation: `Debt-to-income ratio is ${dti.toFixed(2)}%`
    });

    // LTV (Loan-to-Value) Ratio
    const loanAmount = applicationData.loanDetails.loanAmount;
    const propertyValue = applicationData.property.estimatedValue;
    const ltv = (loanAmount / propertyValue) * 100;
    riskFactors.push({
      name: 'LTV Ratio',
      value: ltv,
      impact: ltv > 95 ? 'high' : ltv > 80 ? 'medium' : 'low',
      explanation: `Loan-to-value ratio is ${ltv.toFixed(2)}%`
    });

    // Credit Score Impact
    const creditScore = applicationData.borrowerDetails.creditScore;
    riskFactors.push({
      name: 'Credit Score',
      value: creditScore,
      impact: creditScore < 620 ? 'high' : creditScore < 680 ? 'medium' : 'low',
      explanation: `Credit score is ${creditScore}`
    });

    // Employment History
    const yearsAtJob = applicationData.borrowerDetails.yearsAtJob;
    riskFactors.push({
      name: 'Employment Stability',
      value: yearsAtJob,
      impact: yearsAtJob < 1 ? 'high' : yearsAtJob < 2 ? 'medium' : 'low',
      explanation: `${yearsAtJob} years at current job`
    });

    return riskFactors;
  }

  private async generateRecommendations(riskFactors: any[]) {
    const recommendations = [];

    for (const factor of riskFactors) {
      if (factor.impact === 'high') {
        recommendations.push({
          category: factor.name,
          suggestion: this.getRecommendationForRiskFactor(factor)
        });
      }
    }

    return recommendations;
  }

  private getRecommendationForRiskFactor(factor: any) {
    switch (factor.name) {
      case 'DTI Ratio':
        return 'Consider paying down existing debt or increasing income to improve DTI ratio';
      case 'LTV Ratio':
        return 'A larger down payment would help reduce the loan-to-value ratio';
      case 'Credit Score':
        return 'Work on improving credit score by making timely payments and reducing credit utilization';
      case 'Employment Stability':
        return 'Longer employment history would strengthen the application';
      default:
        return 'Review and address risk factors to strengthen application';
    }
  }

  private async analyzeDocuments(documents: Document[]) {
    const analysis = {
      analyzed: documents.length,
      verified: 0,
      pending: 0,
      issues: 0
    };

    for (const doc of documents) {
      switch (doc.status) {
        case 'verified':
          analysis.verified++;
          break;
        case 'pending':
          analysis.pending++;
          break;
        case 'rejected':
          analysis.issues++;
          break;
      }
    }

    return analysis;
  }

  private calculateRiskScore(riskFactors: any[]) {
    let totalScore = 100;
    
    for (const factor of riskFactors) {
      switch (factor.impact) {
        case 'high':
          totalScore -= 20;
          break;
        case 'medium':
          totalScore -= 10;
          break;
        case 'low':
          totalScore -= 5;
          break;
      }
    }

    return Math.max(0, totalScore);
  }

  private calculateConfidence(riskFactors: any[], documentAnalysis: any) {
    let confidence = 100;

    // Reduce confidence if documents are pending or have issues
    if (documentAnalysis.pending > 0) {
      confidence -= (documentAnalysis.pending * 10);
    }
    if (documentAnalysis.issues > 0) {
      confidence -= (documentAnalysis.issues * 15);
    }

    // Reduce confidence for high-impact risk factors
    const highRiskFactors = riskFactors.filter(f => f.impact === 'high').length;
    confidence -= (highRiskFactors * 10);

    return Math.max(0, confidence);
  }
} 