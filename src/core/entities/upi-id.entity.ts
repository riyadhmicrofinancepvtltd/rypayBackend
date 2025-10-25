// src/virtual-account/entities/virtual-account.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('upi_ids')
export class UPIIds {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ unique: true })
    accountid: string;

    @Column()
    accountnumber: string;

    @Column()
    vpaId: string;

    @Column({ nullable: true })
    ifsccode: string;

    @Column({ default: 'ACTIVE' })
    status: string;

    @CreateDateColumn({ type: 'timestamp' })
    createon: Date;

    @Column()
    userid: string;

    @Column()
    upiId: string;

    @Column()
    number: string;


    @Column({ nullable: true })
    transfer_pin: string;

    @Column({ nullable: true })
    upiQr: string; // will store the S3 key (UUID)

    @ManyToOne(() => User, (user) => user.upiIds, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userid' })
    user: User;

}
