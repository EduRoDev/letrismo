import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Level } from '../levels/levels.entity';

@Entity('game_sessions')
export class GameSession {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.progress, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Level, (level) => level.progress, { onDelete: 'CASCADE' })
    level: Level;

    @Column('json')
    wordsAttempted: {
        wordId: number;
        wordText: string;
        userAnswer: string;
        isCorrect: boolean;
        attempts: number;
    }[];

    @Column({ default: 0 })
    finalScore: number;

    @Column({ default: false })
    isCompleted: boolean;

    @CreateDateColumn()
    playedAt: Date;
}
