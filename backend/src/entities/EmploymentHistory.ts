import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BorrowerDetails } from './BorrowerDetails';
import { EmploymentType } from './types';

@Entity('employment_history')
export class EmploymentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employer_name' })
  employerName: string;

  @Column({ name: 'employer_address' })
  employerAddress: string;

  @Column({ name: 'employer_city' })
  employerCity: string;

  @Column({ name: 'employer_state', length: 2 })
  employerState: string;

  @Column({ name: 'employer_zip_code' })
  employerZipCode: string;

  @Column({ name: 'employer_phone' })
  employerPhone: string;

  @Column()
  position: string;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    name: 'employment_type'
  })
  employmentType: EmploymentType;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column('decimal', { precision: 15, scale: 2, name: 'monthly_income' })
  monthlyIncome: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'annual_income' })
  annualIncome: number;

  @Column({ name: 'is_current_employer', type: 'boolean', default: false })
  isCurrentEmployer: boolean;

  @ManyToOne(() => BorrowerDetails, borrowerDetails => borrowerDetails.employmentHistory)
  @JoinColumn({ name: 'borrower_details_id' })
  borrowerDetails: BorrowerDetails;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 