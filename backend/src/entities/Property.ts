import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PropertyType {
  SINGLE_FAMILY = 'single_family',
  MULTI_FAMILY = 'multi_family',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse'
}

export enum OccupancyType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  INVESTMENT = 'investment'
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({ name: 'zip_code' })
  zipCode: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
    name: 'property_type'
  })
  propertyType: PropertyType;

  @Column('decimal', { precision: 15, scale: 2, name: 'purchase_price' })
  purchasePrice: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'down_payment' })
  downPayment: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'estimated_value' })
  estimatedValue: number;

  @Column({
    type: 'enum',
    enum: OccupancyType,
    name: 'occupancy_type'
  })
  occupancyType: OccupancyType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 