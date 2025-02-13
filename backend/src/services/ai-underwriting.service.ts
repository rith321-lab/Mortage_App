import { supabase } from '../db/connect';
import { logger } from '../utils/logger';

interface RiskFactor {
  name: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  value: number | string;
  threshold?: number | string;
}

interface AIAnalysis {
  riskScore: number;
  confidence: number;
  factors: RiskFactor[];
  recommendations: string[];
  warnings: string[];
  conditions: string[];
}

interface ValidationRules {
  // DTI (Debt-to-Income) thresholds
  MAX_DTI: number;
  HIGH_RISK_DTI: number;
  MEDIUM_RISK_DTI: number;
  
  // LTV (Loan-to-Value) thresholds
  MAX_LTV: number;
  HIGH_RISK_LTV: number;
  MEDIUM_RISK_LTV: number;
  
  // Credit Score thresholds
  MIN_CREDIT_SCORE: number;
  HIGH_RISK_CREDIT_SCORE: number;
  MEDIUM_RISK_CREDIT_SCORE: number;
  
  // Employment thresholds
  MIN_EMPLOYMENT_YEARS: number;
  PREFERRED_EMPLOYMENT_YEARS: number;
  
  // Asset/Reserve thresholds
  MIN_RESERVES_MONTHS: number;
  HIGH_RISK_RESERVES_RATIO: number;
  MEDIUM_RISK_RESERVES_RATIO: number;
  
  // Property types
  PROPERTY_TYPES: {
    SINGLE_FAMILY: string;
    MULTI_FAMILY: string;
    CONDO: string;
    TOWNHOUSE: string;
  };
}

const VALIDATION_RULES: ValidationRules = {
  MAX_DTI: 43,
  HIGH_RISK_DTI: 40,
  MEDIUM_RISK_DTI: 36,
  
  MAX_LTV: 97,
  HIGH_RISK_LTV: 90,
  MEDIUM_RISK_LTV: 80,
  
  MIN_CREDIT_SCORE: 620,
  HIGH_RISK_CREDIT_SCORE: 660,
  MEDIUM_RISK_CREDIT_SCORE: 720,
  
  MIN_EMPLOYMENT_YEARS: 2,
  PREFERRED_EMPLOYMENT_YEARS: 5,
  
  MIN_RESERVES_MONTHS: 2,
  HIGH_RISK_RESERVES_RATIO: 0.03,
  MEDIUM_RISK_RESERVES_RATIO: 0.06,
  
  PROPERTY_TYPES: {
    SINGLE_FAMILY: 'single_family',
    MULTI_FAMILY: 'multi_family',
    CONDO: 'condo',
    TOWNHOUSE: 'townhouse'
  }
};

export class AIUnderwritingService {
  private rules: ValidationRules;

  constructor() {
    this.rules = VALIDATION_RULES;
  }

  async analyzeApplication(applicationId: string): Promise<AIAnalysis> {
    try {
      logger.info('Starting AI analysis for application:', applicationId);

      // Fetch application data
      const { data: application, error } = await supabase
        .from('mortgage_applications')
        .select('*, documents(*)')
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      if (!application) throw new Error('Application not found');

      // Calculate risk factors
      const factors = await this.calculateRiskFactors(application);
      
      // Calculate overall risk score
      const riskScore = this.calculateRiskScore(factors);
      
      // Generate recommendations and conditions
      const recommendations = this.generateRecommendations(factors, application);
      const conditions = this.generateConditions(factors, application);
      
      // Generate warnings
      const warnings = this.generateWarnings(factors, application);

      // Calculate confidence score
      const confidence = this.calculateConfidence(application);

      const analysis: AIAnalysis = {
        riskScore,
        confidence,
        factors,
        recommendations,
        warnings,
        conditions
      };

      // Store analysis results
      await this.storeAnalysisResults(applicationId, analysis);

      logger.info('AI analysis completed successfully', {
        applicationId,
        riskScore,
        confidence
      });

      return analysis;
    } catch (error) {
      logger.error('Error in AI analysis:', error);
      throw error;
    }
  }

  private async calculateRiskFactors(application: any): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];
    
    // DTI Analysis
    const dti = this.calculateDTI(application);
    factors.push({
      name: 'Debt-to-Income Ratio',
      impact: dti > this.rules.HIGH_RISK_DTI ? 'high' : 
             dti > this.rules.MEDIUM_RISK_DTI ? 'medium' : 'low',
      description: 'Monthly debt payments as a percentage of monthly income',
      value: dti,
      threshold: this.rules.MAX_DTI
    });

    // LTV Analysis
    const ltv = this.calculateLTV(application);
    factors.push({
      name: 'Loan-to-Value Ratio',
      impact: ltv > this.rules.HIGH_RISK_LTV ? 'high' : 
             ltv > this.rules.MEDIUM_RISK_LTV ? 'medium' : 'low',
      description: 'Loan amount as a percentage of property value',
      value: ltv,
      threshold: this.rules.MAX_LTV
    });

    // Credit Score Analysis
    const creditScore = application.credit_score;
    factors.push({
      name: 'Credit Score',
      impact: creditScore < this.rules.HIGH_RISK_CREDIT_SCORE ? 'high' : 
              creditScore < this.rules.MEDIUM_RISK_CREDIT_SCORE ? 'medium' : 'low',
      description: 'FICO credit score',
      value: creditScore,
      threshold: this.rules.MIN_CREDIT_SCORE
    });

    // Employment History
    const employmentHistory = application.employment_history || [];
    const employmentStability = this.analyzeEmploymentStability(employmentHistory);
    factors.push({
      name: 'Employment Stability',
      impact: employmentStability.impact,
      description: employmentStability.description,
      value: employmentStability.value
    });

    // Asset Analysis
    const assets = application.assets || [];
    const assetStrength = this.analyzeAssets(assets, application.loan_amount);
    factors.push({
      name: 'Asset Strength',
      impact: assetStrength.impact,
      description: assetStrength.description,
      value: assetStrength.value
    });

    return factors;
  }

  private calculateDTI(application: any): number {
    const monthlyIncome = application.income_details?.monthly_income || 0;
    const monthlyDebt = application.liabilities?.monthly_payments || 0;
    return monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 100;
  }

  private calculateLTV(application: any): number {
    const propertyValue = application.property_details?.value || 0;
    const loanAmount = application.loan_details?.loan_amount || 0;
    return propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 100;
  }

  private analyzeEmploymentStability(employmentHistory: any[]): { impact: 'high' | 'medium' | 'low', description: string, value: string } {
    if (!employmentHistory.length) {
      return {
        impact: 'high',
        description: 'No employment history provided',
        value: '0 years'
      };
    }

    const currentJob = employmentHistory[0];
    const yearsAtCurrentJob = this.calculateYearsAtJob(currentJob.start_date);

    if (yearsAtCurrentJob < this.rules.MIN_EMPLOYMENT_YEARS) {
      return {
        impact: 'high',
        description: 'Less than minimum required employment history',
        value: `${yearsAtCurrentJob.toFixed(1)} years`
      };
    } else if (yearsAtCurrentJob < this.rules.PREFERRED_EMPLOYMENT_YEARS) {
      return {
        impact: 'medium',
        description: 'Moderate employment history',
        value: `${yearsAtCurrentJob.toFixed(1)} years`
      };
    } else {
      return {
        impact: 'low',
        description: 'Strong employment history',
        value: `${yearsAtCurrentJob.toFixed(1)} years`
      };
    }
  }

  private analyzeAssets(assets: any[], loanAmount: number): { impact: 'high' | 'medium' | 'low', description: string, value: number } {
    const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const reserveRatio = totalAssets / (loanAmount || 1);

    if (reserveRatio < this.rules.HIGH_RISK_RESERVES_RATIO) {
      return {
        impact: 'high',
        description: 'Insufficient reserves',
        value: totalAssets
      };
    } else if (reserveRatio < this.rules.MEDIUM_RISK_RESERVES_RATIO) {
      return {
        impact: 'medium',
        description: 'Moderate reserves',
        value: totalAssets
      };
    } else {
      return {
        impact: 'low',
        description: 'Strong reserves',
        value: totalAssets
      };
    }
  }

  private calculateRiskScore(factors: RiskFactor[]): number {
    let score = 100;
    
    factors.forEach(factor => {
      switch (factor.impact) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 0;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private calculateConfidence(application: any): number {
    // Start with 100% confidence
    let confidence = 100;

    // Reduce confidence based on missing or incomplete data
    if (!application.credit_score) confidence -= 20;
    if (!application.income_details?.monthly_income) confidence -= 15;
    if (!application.employment_history?.length) confidence -= 15;
    if (!application.assets?.length) confidence -= 10;
    if (!application.documents?.length) confidence -= 10;

    // Ensure confidence stays within 0-100 range
    return Math.max(0, Math.min(100, confidence));
  }

  private generateRecommendations(factors: RiskFactor[], application: any): string[] {
    const recommendations: string[] = [];

    factors.forEach(factor => {
      if (factor.impact === 'high') {
        switch (factor.name) {
          case 'Debt-to-Income Ratio':
            recommendations.push('Consider debt consolidation to reduce monthly payments');
            recommendations.push('Look for opportunities to increase income');
            break;
          case 'Loan-to-Value Ratio':
            recommendations.push('Consider making a larger down payment');
            recommendations.push('Explore down payment assistance programs');
            break;
          case 'Credit Score':
            recommendations.push('Work on improving credit score before proceeding');
            recommendations.push('Review credit report for potential errors');
            break;
          case 'Employment Stability':
            recommendations.push('Provide detailed explanation of employment history');
            recommendations.push('Consider waiting for more employment history');
            break;
          case 'Asset Strength':
            recommendations.push('Consider building additional reserves');
            recommendations.push('Explore gift funds or other asset sources');
            break;
        }
      }
    });

    return recommendations;
  }

  private generateWarnings(factors: RiskFactor[], application: any): string[] {
    const warnings: string[] = [];

    factors.forEach(factor => {
      if (factor.impact === 'high') {
        warnings.push(`High risk factor: ${factor.name} - ${factor.description}`);
      }
    });

    // Add specific warnings based on application data
    if (!application.documents?.length) {
      warnings.push('No supporting documents provided');
    }

    if (application.credit_score < this.rules.MIN_CREDIT_SCORE) {
      warnings.push('Credit score below minimum requirement');
    }

    return warnings;
  }

  private generateConditions(factors: RiskFactor[], application: any): string[] {
    const conditions: string[] = [
      'Verification of employment required',
      'Verification of assets required',
      'Property appraisal required'
    ];

    factors.forEach(factor => {
      if (factor.impact === 'high' || factor.impact === 'medium') {
        switch (factor.name) {
          case 'Debt-to-Income Ratio':
            conditions.push('Detailed debt verification required');
            conditions.push('Recent bank statements showing debt payments');
            break;
          case 'Asset Strength':
            conditions.push('Additional reserves documentation required');
            conditions.push('Source of funds documentation required');
            break;
          case 'Employment Stability':
            conditions.push('Additional employment verification required');
            conditions.push('Written explanation of employment history required');
            break;
        }
      }
    });

    return conditions;
  }

  private calculateYearsAtJob(startDate: string): number {
    const start = new Date(startDate);
    const now = new Date();
    return (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }

  private async storeAnalysisResults(applicationId: string, analysis: AIAnalysis): Promise<void> {
    try {
      const { error } = await supabase
        .from('mortgage_applications')
        .update({
          ai_analysis: analysis,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error storing analysis results:', error);
      throw error;
    }
  }
}

export const aiUnderwritingService = new AIUnderwritingService(); 