import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { MortgageApplication } from './MortgageApplication';

export enum AssetType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  INVESTMENT = 'investment',
  RETIREMENT = 'retirement',
  OTHER = 'other'
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AssetType,
    name: 'asset_type'
  })
  assetType: AssetType;

  @Column({ name: 'institution_name' })
  institutionName: string;

  @Column({ name: 'account_number', nullable: true })
  accountNumber: string;

  @Column('decimal', { precision: 15, scale: 2, name: 'current_value' })
  currentValue: number;

  @ManyToOne(() => MortgageApplication, application => application.assets)
  @JoinColumn({ name: 'mortgage_application_id' })
  mortgageApplication: MortgageApplication;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 