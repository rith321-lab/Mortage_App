import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { MortgageApplication } from './MortgageApplication';
import { EmploymentHistory } from './EmploymentHistory';
import { Liability } from './Liability';
import { EmploymentType } from './types';
import { Asset } from './Asset';

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed'
}

export enum IncomeFrequency {
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  SEMI_MONTHLY = 'semi_monthly',
  MONTHLY = 'monthly',
  ANNUAL = 'annual'
}

@Entity('borrower_details')
export class BorrowerDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: MaritalStatus,
    name: 'marital_status'
  })
  maritalStatus: MaritalStatus;

  @Column({ name: 'current_address' })
  currentAddress: string;

  @Column({ name: 'current_city' })
  currentCity: string;

  @Column({ name: 'current_state', length: 2 })
  currentState: string;

  @Column({ name: 'current_zip' })
  currentZip: string;

  @Column({ name: 'years_at_current_address' })
  yearsAtCurrentAddress: number;

  @Column({ name: 'social_security_number', nullable: true })
  socialSecurityNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => MortgageApplication, application => application.borrowerDetails)
  @JoinColumn({ name: 'application_id' })
  application: MortgageApplication;

  @OneToMany(() => EmploymentHistory, employment => employment.borrowerDetails)
  employmentHistory: EmploymentHistory[];

  @OneToMany(() => Asset, asset => asset.borrowerDetails)
  assets: Asset[];

  @OneToMany(() => Liability, liability => liability.borrowerDetails)
  liabilities: Liability[];
} 