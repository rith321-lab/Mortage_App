import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { MortgageApplication } from './MortgageApplication';

export enum DocumentType {
  PAY_STUB = 'pay_stub',
  W2 = 'w2',
  TAX_RETURN = 'tax_return',
  BANK_STATEMENT = 'bank_statement',
  DRIVERS_LICENSE = 'drivers_license',
  OTHER = 'other'
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    name: 'document_type'
  })
  documentType: DocumentType;

  @Column()
  filename: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ nullable: true })
  path: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING
  })
  status: DocumentStatus;

  @ManyToOne(() => MortgageApplication, application => application.documents)
  @JoinColumn({ name: 'mortgage_application_id' })
  mortgageApplication: MortgageApplication;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 