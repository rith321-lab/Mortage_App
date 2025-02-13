import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { MortgageApplication } from './MortgageApplication';

export enum UserRole {
  BUYER = 'buyer',
  LENDER = 'lender',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BUYER
  })
  role: UserRole;

  @Column({ nullable: true })
  phone?: string;

  @OneToMany(() => MortgageApplication, application => application.user)
  applications: MortgageApplication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 