import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1739424245814 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM ('buyer', 'lender', 'admin');

            CREATE TABLE "users" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "first_name" character varying(100),
                "last_name" character varying(100),
                "email" character varying(255) UNIQUE NOT NULL,
                "password" character varying(255) NOT NULL,
                "phone" character varying(20),
                "role" "user_role_enum" NOT NULL DEFAULT 'buyer',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            CREATE TYPE "application_status_enum" AS ENUM (
                'draft', 'submitted', 'processing', 'underwriting', 'approved',
                'conditionally_approved', 'rejected', 'needs_review',
                'ai_analysis_pending', 'ai_analysis_completed', 'ai_analysis_failed'
            );

            CREATE TABLE "mortgage_applications" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "application_number" character varying(50) UNIQUE NOT NULL,
                "status" "application_status_enum" NOT NULL DEFAULT 'draft',
                "submission_date" TIMESTAMP WITH TIME ZONE,
                "last_updated_by" uuid,
                "metadata" jsonb,
                "ai_analysis_results" jsonb,
                "user_id" uuid REFERENCES "users" (id),
                "property_id" uuid,
                "loan_details_id" uuid,
                "borrower_details_id" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            CREATE TYPE "property_type_enum" AS ENUM ('single_family', 'multi_family', 'condo', 'townhouse');

            CREATE TABLE "properties" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "address" character varying(255) NOT NULL,
                "city" character varying(100) NOT NULL,
                "state" character varying(2) NOT NULL,
                "zip_code" character varying(10) NOT NULL,
                "property_type" "property_type_enum" NOT NULL,
                "purchase_price" decimal(12,2) NOT NULL,
                "estimated_value" decimal(12,2) NOT NULL,
                "year_built" integer NOT NULL,
                "square_feet" integer,
                "lot_size" decimal(10,2),
                "number_of_bedrooms" integer,
                "number_of_bathrooms" decimal(3,1),
                "property_tax" decimal(10,2),
                "insurance_cost" decimal(10,2),
                "hoa_fees" decimal(10,2),
                "metadata" jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            CREATE TYPE "loan_type_enum" AS ENUM ('conventional', 'fha', 'va', 'jumbo');
            CREATE TYPE "loan_purpose_enum" AS ENUM ('purchase', 'refinance', 'cash_out_refinance');

            CREATE TABLE "loan_details" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "loan_type" "loan_type_enum" NOT NULL,
                "loan_purpose" "loan_purpose_enum" NOT NULL,
                "loan_amount" decimal(12,2) NOT NULL,
                "down_payment" decimal(12,2) NOT NULL,
                "interest_rate" decimal(5,3),
                "loan_term_years" integer NOT NULL,
                "monthly_payment" decimal(10,2),
                "estimated_closing_costs" decimal(10,2),
                "pmi_required" boolean NOT NULL DEFAULT false,
                "pmi_amount" decimal(10,2),
                "escrow_required" boolean NOT NULL DEFAULT true,
                "escrow_amount" decimal(10,2),
                "metadata" jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            CREATE TYPE "marital_status_enum" AS ENUM ('single', 'married', 'divorced', 'widowed', 'separated');
            CREATE TYPE "employment_type_enum" AS ENUM ('full_time', 'part_time', 'self_employed', 'retired', 'unemployed');
            CREATE TYPE "income_frequency_enum" AS ENUM ('weekly', 'bi_weekly', 'semi_monthly', 'monthly', 'annual');

            CREATE TABLE "borrower_details" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "social_security_number" character varying(11) NOT NULL,
                "date_of_birth" date NOT NULL,
                "marital_status" "marital_status_enum" NOT NULL,
                "current_address" character varying(255) NOT NULL,
                "current_city" character varying(100) NOT NULL,
                "current_state" character varying(2) NOT NULL,
                "current_zip_code" character varying(10) NOT NULL,
                "years_at_current_address" integer NOT NULL,
                "months_at_current_address" integer NOT NULL,
                "previous_address" character varying(255),
                "previous_city" character varying(100),
                "previous_state" character varying(2),
                "previous_zip_code" character varying(10),
                "annual_income" decimal(12,2) NOT NULL,
                "monthly_income" decimal(12,2) NOT NULL,
                "employment_type" "employment_type_enum" NOT NULL,
                "employer_name" character varying(255) NOT NULL,
                "job_title" character varying(100) NOT NULL,
                "years_at_job" decimal(4,2) NOT NULL,
                "years_in_profession" decimal(4,2) NOT NULL,
                "credit_score" integer,
                "monthly_debt_payments" decimal(10,2) NOT NULL,
                "bankruptcy_history" boolean NOT NULL DEFAULT false,
                "bankruptcy_discharge_date" TIMESTAMP WITH TIME ZONE,
                "foreclosure_history" boolean NOT NULL DEFAULT false,
                "foreclosure_date" TIMESTAMP WITH TIME ZONE,
                "additional_income_sources" jsonb,
                "metadata" jsonb,
                "application_id" uuid REFERENCES "mortgage_applications" (id),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            CREATE TABLE "employment_history" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "employer_name" character varying(255) NOT NULL,
                "employer_address" character varying(255) NOT NULL,
                "employer_city" character varying(100) NOT NULL,
                "employer_state" character varying(2) NOT NULL,
                "employer_zip_code" character varying(10) NOT NULL,
                "employer_phone" character varying(20) NOT NULL,
                "position" character varying(100) NOT NULL,
                "employment_type" "employment_type_enum" NOT NULL,
                "start_date" date NOT NULL,
                "end_date" date,
                "monthly_income" decimal(15,2) NOT NULL,
                "annual_income" decimal(15,2) NOT NULL,
                "is_current_employer" boolean NOT NULL DEFAULT false,
                "borrower_details_id" uuid REFERENCES "borrower_details" (id),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            CREATE TYPE "asset_type_enum" AS ENUM ('checking', 'savings', 'investment', 'retirement', 'other');

            CREATE TABLE "assets" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "type" "asset_type_enum" NOT NULL,
                "institution" character varying(255) NOT NULL,
                "account_number" character varying(255) NOT NULL,
                "value" decimal(12,2) NOT NULL,
                "metadata" jsonb,
                "borrower_details_id" uuid REFERENCES "borrower_details" (id),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            CREATE TYPE "liability_type_enum" AS ENUM ('credit_card', 'car_loan', 'student_loan', 'personal_loan', 'other');

            CREATE TABLE "liabilities" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "type" "liability_type_enum" NOT NULL,
                "creditor" character varying(255) NOT NULL,
                "account_number" character varying(255) NOT NULL,
                "monthly_payment" decimal(10,2) NOT NULL,
                "outstanding_balance" decimal(12,2) NOT NULL,
                "metadata" jsonb,
                "borrower_details_id" uuid REFERENCES "borrower_details" (id),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            CREATE TYPE "document_type_enum" AS ENUM (
                'w2', 'pay_stub', 'tax_return', 'bank_statement', 'drivers_license',
                'social_security_card', 'property_insurance', 'property_tax', 'other'
            );

            CREATE TYPE "document_status_enum" AS ENUM ('pending', 'approved', 'rejected', 'needs_review');

            CREATE TABLE "documents" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "type" "document_type_enum" NOT NULL DEFAULT 'other',
                "name" character varying(255) NOT NULL,
                "url" character varying(255) NOT NULL,
                "mime_type" character varying(255),
                "size" bigint,
                "status" "document_status_enum" NOT NULL DEFAULT 'pending',
                "notes" text,
                "metadata" jsonb,
                "application_id" uuid REFERENCES "mortgage_applications" (id),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            -- Add foreign key constraints to mortgage_applications
            ALTER TABLE "mortgage_applications"
                ADD CONSTRAINT "fk_mortgage_applications_property"
                FOREIGN KEY ("property_id") REFERENCES "properties" (id),
                ADD CONSTRAINT "fk_mortgage_applications_loan_details"
                FOREIGN KEY ("loan_details_id") REFERENCES "loan_details" (id),
                ADD CONSTRAINT "fk_mortgage_applications_borrower_details"
                FOREIGN KEY ("borrower_details_id") REFERENCES "borrower_details" (id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "documents";
            DROP TABLE IF EXISTS "liabilities";
            DROP TABLE IF EXISTS "assets";
            DROP TABLE IF EXISTS "employment_history";
            DROP TABLE IF EXISTS "borrower_details";
            DROP TABLE IF EXISTS "mortgage_applications";
            DROP TABLE IF EXISTS "loan_details";
            DROP TABLE IF EXISTS "properties";
            DROP TABLE IF EXISTS "users";

            DROP TYPE IF EXISTS "document_status_enum";
            DROP TYPE IF EXISTS "document_type_enum";
            DROP TYPE IF EXISTS "liability_type_enum";
            DROP TYPE IF EXISTS "asset_type_enum";
            DROP TYPE IF EXISTS "employment_type_enum";
            DROP TYPE IF EXISTS "income_frequency_enum";
            DROP TYPE IF EXISTS "marital_status_enum";
            DROP TYPE IF EXISTS "loan_purpose_enum";
            DROP TYPE IF EXISTS "loan_type_enum";
            DROP TYPE IF EXISTS "property_type_enum";
            DROP TYPE IF EXISTS "application_status_enum";
            DROP TYPE IF EXISTS "user_role_enum";
        `);
    }
} 