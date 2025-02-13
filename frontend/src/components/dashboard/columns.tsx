import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export type Application = {
  id: string;
  applicantName: string;
  loanAmount: number;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  submittedAt: string;
  riskScore: number;
}

export const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "applicantName",
    header: "Applicant",
  },
  {
    accessorKey: "loanAmount",
    header: "Loan Amount",
    cell: ({ row }) => formatCurrency(row.getValue("loanAmount")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={
          status === 'approved' ? 'success' :
          status === 'rejected' ? 'destructive' :
          status === 'in_review' ? 'warning' :
          'default'
        }>
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => formatDate(row.getValue("submittedAt")),
  },
  {
    accessorKey: "riskScore",
    header: "Risk Score",
    cell: ({ row }) => {
      const score = row.getValue("riskScore") as number;
      return (
        <Badge variant={
          score >= 80 ? 'success' :
          score >= 60 ? 'warning' :
          'destructive'
        }>
          {score}
        </Badge>
      );
    },
  },
]; 