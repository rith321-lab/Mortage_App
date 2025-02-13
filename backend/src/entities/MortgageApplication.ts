import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Property } from './Property';
import { LoanDetails } from './LoanDetails';
import { BorrowerDetails } from './BorrowerDetails';
import { Asset } from './Asset';
import { Liability } from './Liability';
import { Document } from './Document';

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('mortgage_applications')
export class MortgageApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT
  })
  status: ApplicationStatus;

  @OneToOne(() => Property)
  @JoinColumn()
  property: Property;

  @OneToOne(() => LoanDetails)
  @JoinColumn()
  loanDetails: LoanDetails;

  @OneToOne(() => BorrowerDetails)
  @JoinColumn()
  borrowerDetails: BorrowerDetails;

  @OneToMany(() => Asset, asset => asset.mortgageApplication)
  assets: Asset[];

  @OneToMany(() => Liability, liability => liability.mortgageApplication)
  liabilities: Liability[];

  @OneToMany(() => Document, document => document.mortgageApplication)
  documents: Document[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;
} 