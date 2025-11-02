import { Progress } from '../progress/progress.entity';
import { Word } from '../words/words.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('levels')
export class Level {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    levelNumber: number;
    
    @Column()
    description: string;

    @OneToMany(() => Word, (word) => word.level)
    words: Word[]

    @OneToMany(() => Progress, (progress) => progress.level)
    progress: Progress[];

}