import { supabase } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { logger } from './logger.service';

interface UnderwritingCriteria {
  creditScore: number;
  dti: number;  // Debt-to-Income ratio
  ltv: number;  // Loan-to-Value ratio
  employmentHistory: number; // years
  monthlyIncome: number;
  monthlyDebt: number;
  propertyValue: number;
  loanAmount: number;
}

export class AIUnderwritingService {
  private async calculateRiskScore(criteria: UnderwritingCriteria): Promise<number> {
    let riskScore = 100; // Start with perfect score

    // Credit Score Impact (max deduction: 30 points)
    if (criteria.creditScore < 580) riskScore -= 30;
    else if (criteria.creditScore < 640) riskScore -= 25;
    else if (criteria.creditScore < 700) riskScore -= 15;
    else if (criteria.creditScore < 740) riskScore -= 5;

    // DTI Impact (max deduction: 20 points)
    if (criteria.dti > 43) riskScore -= 20;
    else if (criteria.dti > 36) riskScore -= 15;
    else if (criteria.dti > 28) riskScore -= 10;

    // LTV Impact (max deduction: 20 points)
    if (criteria.ltv > 95) riskScore -= 20;
    else if (criteria.ltv > 90) riskScore -= 15;
    else if (criteria.ltv > 80) riskScore -= 10;

    // Employment History Impact (max deduction: 15 points)
    if (criteria.employmentHistory < 1) riskScore -= 15;
    else if (criteria.employmentHistory < 2) riskScore -= 10;
    else if (criteria.employmentHistory < 3) riskScore -= 5;

    // Income Stability (max deduction: 15 points)
    const monthlyDebtToIncomeRatio = criteria.monthlyDebt / criteria.monthlyIncome;
    if (monthlyDebtToIncomeRatio > 0.5) riskScore -= 15;
    else if (monthlyDebtToIncomeRatio > 0.4) riskScore -= 10;
    else if (monthlyDebtToIncomeRatio > 0.3) riskScore -= 5;

    return riskScore;
  }

  async evaluateApplication(applicationId: string): Promise<void> {
    try {
      // Fetch application data
      const { data: application, error } = await supabase
        .from('mortgage_applications')
        .select(`
          *,
          documents (*)
        `)
        .eq('id', applicationId)
        .single();

      if (error || !application) {
        throw new AppError(404, 'Application not found');
      }

      // Calculate key metrics
      const criteria: UnderwritingCriteria = {
        creditScore: application.credit_score,
        dti: (application.liabilities.monthly_payments / application.income_details.monthly_income) * 100,
        ltv: (application.loan_amount / application.property_details.value) * 100,
        employmentHistory: application.income_details.years_at_job,
        monthlyIncome: application.income_details.monthly_income,
        monthlyDebt: application.liabilities.monthly_payments,
        propertyValue: application.property_details.value,
        loanAmount: application.loan_amount
      };

      const riskScore = await this.calculateRiskScore(criteria);
      
      // Generate recommendation
      let recommendation: 'approved' | 'manual_review' | 'rejected' = 'manual_review';
      if (riskScore >= 80) recommendation = 'approved';
      else if (riskScore < 60) recommendation = 'rejected';

      // Update application with analysis
      const { error: updateError } = await supabase
        .from('mortgage_applications')
        .update({
          ai_analysis: {
            risk_score: riskScore,
            criteria,
            recommendation,
            analyzed_at: new Date().toISOString()
          },
          status: recommendation === 'approved' ? 'approved' : 
                 recommendation === 'rejected' ? 'rejected' : 'in_review'
        })
        .eq('id', applicationId);

      if (updateError) {
        throw new AppError(500, 'Failed to update application with analysis');
      }

      logger.info('AI Underwriting completed', {
        applicationId,
        riskScore,
        recommendation
      });

    } catch (error) {
      logger.error('AI Underwriting failed', {
        applicationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error instanceof AppError ? error : new AppError(500, 'AI Underwriting failed');
    }
  }
}

export const aiUnderwritingService = new AIUnderwritingService(); 