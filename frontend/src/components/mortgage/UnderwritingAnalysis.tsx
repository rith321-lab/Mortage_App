import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mortgageService } from '@/services/mortgage.service';

interface UnderwritingAnalysisProps {
  applicationId: string;
}

export function UnderwritingAnalysis({ applicationId }: UnderwritingAnalysisProps) {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['analysis', applicationId],
    queryFn: () => mortgageService.getAnalysis(applicationId),
    enabled: !!applicationId,
  });

  if (isLoading) {
    return <div>Loading analysis...</div>;
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Underwriting Analysis</CardTitle>
        <CardDescription>
          Automated analysis of your mortgage application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Risk Assessment</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold">{analysis.riskScore}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">DTI Ratio</p>
                <p className="text-2xl font-bold">{analysis.dtiRatio}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LTV Ratio</p>
                <p className="text-2xl font-bold">{analysis.ltvRatio}%</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Key Findings</h3>
            <ul className="space-y-2">
              {analysis.findings.map((finding: string, index: number) => (
                <li key={index} className="text-sm">
                  • {finding}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Recommendations</h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="text-sm">
                  • {recommendation}
                </li>
              ))}
            </ul>
          </div>

          {analysis.warnings && analysis.warnings.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-yellow-600">Warnings</h3>
              <ul className="space-y-2">
                {analysis.warnings.map((warning: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-600">
                    ⚠️ {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 