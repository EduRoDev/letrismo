import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Cosmetic } from './cosmetics.entity';

@Entity('user_cosmetics')
export class UserCosmetic {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.cosmetics, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Cosmetic, (cosmetic) => cosmetic.userCosmetics, { onDelete: 'CASCADE' })
    cosmetic: Cosmetic;

    @Column({ default: false })
    isEquipped: boolean;  // Si tiene este conjunto puesto ahora

    @CreateDateColumn()
    purchaseDate: Date;  // Cuándo lo compró
}
