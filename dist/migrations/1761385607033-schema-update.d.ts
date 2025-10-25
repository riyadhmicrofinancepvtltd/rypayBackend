import { MigrationInterface, QueryRunner } from "typeorm";
export declare class SchemaUpdate1761385607033 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
