import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum LoanType {
  CONVENTIONAL = 'conventional',
  FHA = 'fha',
  VA = 'va',
  JUMBO = 'jumbo'
}

export enum LoanTerm {
  YEARS_15 = '15',
  YEARS_20 = '20',
  YEARS_30 = '30'
}

@Entity('loan_details')
export class LoanDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LoanType,
    name: 'loan_type'
  })
  loanType: LoanType;

  @Column({
    type: 'enum',
    enum: LoanTerm,
    name: 'loan_term'
  })
  loanTerm: LoanTerm;

  @Column('decimal', { precision: 15, scale: 2, name: 'loan_amount' })
  loanAmount: number;

  @Column('decimal', { precision: 5, scale: 2, name: 'interest_rate', nullable: true })
  interestRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 