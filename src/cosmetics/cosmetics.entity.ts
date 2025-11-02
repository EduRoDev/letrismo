import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserCosmetic } from './user-cosmetic.entity';

@Entity('cosmetics')
export class Cosmetic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;  

    @Column()
    description: string;  

    @Column()
    cost: number;  

    @Column()
    imageUrl: string;  

    @Column({ default: true })
    isActive: boolean;  

    @OneToMany(() => UserCosmetic, (userCosmetic) => userCosmetic.cosmetic)
    userCosmetics: UserCosmetic[];
}
