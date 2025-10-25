"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaUpdate1761385607033 = void 0;
class SchemaUpdate1761385607033 {
    constructor() {
        this.name = 'SchemaUpdate1761385607033';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "upi_ids" ("id" SERIAL NOT NULL, "accountid" character varying NOT NULL, "accountnumber" character varying NOT NULL, "vpaId" character varying NOT NULL, "ifsccode" character varying, "status" character varying NOT NULL DEFAULT 'ACTIVE', "createon" TIMESTAMP NOT NULL DEFAULT now(), "userid" integer NOT NULL, "upiId" character varying NOT NULL, "number" character varying NOT NULL, "transfer_pin" character varying, "upiQr" character varying, CONSTRAINT "UQ_c37c970be6c3c90f82cb7862324" UNIQUE ("accountid"), CONSTRAINT "PK_53843c735449f2cf64094353807" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "upi_collections_transaction_money" ("id" SERIAL NOT NULL, "name" character varying, "amount" numeric, "status" character varying DEFAULT 'PENDING', "transaction_date" TIMESTAMP DEFAULT now(), "user_id" character varying, "transaction_id" character varying, "reference" character varying, "message" character varying, "type" character varying DEFAULT 'CREDIT', "bank" character varying, "ifsc" character varying, "convenience_fee" numeric, "transaction_mode" character varying, "number" character varying, "upi" character varying, "bank_mode" character varying, "data" jsonb, CONSTRAINT "PK_4b4add3af86b32551f1525796ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "upi_ids" ADD CONSTRAINT "FK_d6ca9c5ba686954e49a956f4301" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "virtual_accounts" ADD CONSTRAINT "FK_dd1060b019d9106099b1c51de52" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "virtual_accounts" DROP CONSTRAINT "FK_dd1060b019d9106099b1c51de52"`);
        await queryRunner.query(`ALTER TABLE "upi_ids" DROP CONSTRAINT "FK_d6ca9c5ba686954e49a956f4301"`);
        await queryRunner.query(`CREATE TYPE "public"."busybox_webhook_responses_type_enum_old" AS ENUM('KYC_EVENT', 'TRANSACTION', 'UPI', 'DEBIT', 'PAYOUT', 'QR_Payment')`);
        await queryRunner.query(`ALTER TABLE "busybox_webhook_responses" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "busybox_webhook_responses" ALTER COLUMN "type" TYPE "public"."busybox_webhook_responses_type_enum_old" USING "type"::"text"::"public"."busybox_webhook_responses_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "busybox_webhook_responses" ALTER COLUMN "type" SET DEFAULT 'TRANSACTION'`);
        await queryRunner.query(`DROP TYPE "public"."busybox_webhook_responses_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."busybox_webhook_responses_type_enum_old" RENAME TO "busybox_webhook_responses_type_enum"`);
        await queryRunner.query(`ALTER TABLE "rewards" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "rewards" ADD "name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "rewards" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "rewards" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rewards" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rewards" ALTER COLUMN "is_read" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rewards" ALTER COLUMN "balance" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "bank_mode"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "bank_mode" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "upi"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "upi" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "number"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "number" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "transaction_mode"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "transaction_mode" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ALTER COLUMN "convenience_fee" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ALTER COLUMN "convenience_fee" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ALTER COLUMN "convenience_fee" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "ifsc"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "ifsc" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "bank"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "bank" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "type" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "message" text`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "reference"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "reference" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "transaction_id"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "transaction_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "user_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ALTER COLUMN "transaction_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ALTER COLUMN "transaction_date" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "status" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ALTER COLUMN "amount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction_money" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "transaction_money" ADD "name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transaction_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transaction_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "bank"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "bank" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "message" text`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "ifsc"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "ifsc" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reason"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reason" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "full_name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "virtual_accounts" ALTER COLUMN "transfer_pin" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "virtual_accounts" ALTER COLUMN "number" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "virtual_accounts" DROP COLUMN "userid"`);
        await queryRunner.query(`ALTER TABLE "virtual_accounts" ADD "userid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "virtual_accounts" ALTER COLUMN "createon" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "virtual_accounts" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`DROP TABLE "upi_collections_transaction_money"`);
        await queryRunner.query(`DROP TABLE "upi_ids"`);
    }
}
exports.SchemaUpdate1761385607033 = SchemaUpdate1761385607033;
//# sourceMappingURL=1761385607033-schema-update.js.map