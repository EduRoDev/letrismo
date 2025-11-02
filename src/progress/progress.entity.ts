import { Level } from "src/levels/levels.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('progress')
export class Progress {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.progress, {onDelete: 'CASCADE'})
    user: User;

    @ManyToOne(() => Level, (level) => level.progress, {onDelete: 'CASCADE'})
    level: Level;

    @Column({default: 0})
    score: number;

    @Column({default: false})
    complete: boolean;

}