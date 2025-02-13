import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordRemoveSupabaseId1739424245813 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_role_enum first
        await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM ('buyer', 'lender', 'admin');
        `);

        // Create users table
        await queryRunner.query(`
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
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum" CASCADE`);
    }

}
