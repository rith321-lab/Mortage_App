import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { BarChart, DollarSign, Users, FileText } from 'lucide-react';
import { fetchDashboardStats } from '@/api/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/dashboard/columns';
import { DashboardChart } from '@/components/dashboard/DashboardChart';

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{isLoading ? <Skeleton className="h-8 w-24" /> : value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your mortgage application dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={stats?.totalApplications || 0}
          icon={FileText}
          description="Total applications this month"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={Users}
          description="Active users in the system"
        />
        <StatCard
          title="Total Volume"
          value={`$${stats?.totalVolume?.toLocaleString() || 0}`}
          icon={DollarSign}
          description="Total loan volume this month"
        />
        <StatCard
          title="Approval Rate"
          value={`${stats?.approvalRate || 0}%`}
          icon={BarChart}
          description="Application approval rate"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <div className="p-6">
            <h3 className="text-lg font-medium">Application Volume</h3>
            <DashboardChart data={stats?.chartData} />
          </div>
        </Card>
        <Card className="col-span-3">
          <div className="p-6">
            <h3 className="text-lg font-medium">Recent Applications</h3>
            {stats?.recentApplications && (
              <DataTable columns={columns} data={stats.recentApplications} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 