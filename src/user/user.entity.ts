import { Progress } from '../progress/progress.entity';
import { UserCosmetic } from '../cosmetics/user-cosmetic.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ default: 0 })
    totalPoints: number;  // Puntos totales ganados

    @Column({ default: 0 })
    availablePoints: number;  // Puntos disponibles para gastar

    @OneToMany(() => Progress, (progress) => progress.user)
    progress: Progress[];

    @OneToMany(() => UserCosmetic, (cosmetic) => cosmetic.user)
    cosmetics: UserCosmetic[];
}