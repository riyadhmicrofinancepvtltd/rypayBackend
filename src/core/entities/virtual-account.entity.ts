// src/virtual-account/entities/virtual-account.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('virtual_accounts')
export class VirtualAccount {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;


    @Column({ unique: true })
    accountid: string;

    @Column()
    accountnumber: string;

    @Column()
    ifsccode: string;

    @Column({ default: 'ACTIVE' })
    status: string;

    @CreateDateColumn({ type: 'timestamp' })
    createon: Date;

    @Column()
    userid: string;

    @Column()
    number: string;

    @Column()
    transfer_pin: string;
}
