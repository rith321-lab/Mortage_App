import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { MortgageApplication } from './MortgageApplication';

export enum LiabilityType {
  CREDIT_CARD = 'credit_card',
  CAR_LOAN = 'car_loan',
  STUDENT_LOAN = 'student_loan',
  PERSONAL_LOAN = 'personal_loan',
  OTHER = 'other'
}

@Entity('liabilities')
export class Liability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LiabilityType,
    name: 'liability_type'
  })
  liabilityType: LiabilityType;

  @Column({ name: 'creditor_name' })
  creditorName: string;

  @Column({ name: 'account_number', nullable: true })
  accountNumber: string;

  @Column('decimal', { precision: 15, scale: 2, name: 'current_balance' })
  currentBalance: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'monthly_payment' })
  monthlyPayment: number;

  @ManyToOne(() => MortgageApplication, application => application.liabilities)
  @JoinColumn({ name: 'mortgage_application_id' })
  mortgageApplication: MortgageApplication;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 