import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Level } from '../levels/levels.entity';

@Entity('words')
export class Word {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @ManyToOne(() => Level, (level) => level.words)
    level: Level;
}