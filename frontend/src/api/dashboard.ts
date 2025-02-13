import { api } from '@/lib/api';

export interface DashboardStats {
  totalApplications: number;
  activeUsers: number;
  totalVolume: number;
  approvalRate: number;
  chartData: Array<{
    date: string;
    value: number;
  }>;
  recentApplications: Array<{
    id: string;
    applicantName: string;
    loanAmount: number;
    status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
    submittedAt: string;
    riskScore: number;
    aiConfidence: number;
  }>;
}

// Mock data for the dashboard
const mockData: DashboardStats = {
  totalApplications: 156,
  activeUsers: 89,
  totalVolume: 45600000, // $45.6M
  approvalRate: 78,
  chartData: [
    { date: '2024-01', value: 12 },
    { date: '2024-02', value: 19 },
    { date: '2024-03', value: 15 },
    { date: '2024-04', value: 22 },
    { date: '2024-05', value: 28 },
    { date: '2024-06', value: 25 },
    { date: '2024-07', value: 35 },
  ],
  recentApplications: [
    {
      id: '1',
      applicantName: 'John Smith',
      loanAmount: 450000,
      status: 'approved',
      submittedAt: '2024-02-10',
      riskScore: 85,
      aiConfidence: 92
    },
    {
      id: '2',
      applicantName: 'Sarah Johnson',
      loanAmount: 375000,
      status: 'in_review',
      submittedAt: '2024-02-11',
      riskScore: 78,
      aiConfidence: 88
    },
    {
      id: '3',
      applicantName: 'Michael Brown',
      loanAmount: 525000,
      status: 'submitted',
      submittedAt: '2024-02-12',
      riskScore: 72,
      aiConfidence: 85
    },
    {
      id: '4',
      applicantName: 'Emily Davis',
      loanAmount: 625000,
      status: 'draft',
      submittedAt: '2024-02-13',
      riskScore: 90,
      aiConfidence: 95
    }
  ]
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // For now, return mock data instead of making an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, 1000); // Simulate network delay
  });
}

export async function fetchAIPerformanceMetrics() {
  const { data } = await api.get('/api/dashboard/ai-performance');
  return data;
}

export async function fetchRiskAnalytics() {
  const { data } = await api.get('/api/dashboard/risk-analytics');
  return data;
}

export async function fetchDocumentAnalytics() {
  const { data } = await api.get('/api/dashboard/document-analytics');
  return data;
}

export async function fetchProcessingMetrics() {
  const { data } = await api.get('/api/dashboard/processing-metrics');
  return data;
}