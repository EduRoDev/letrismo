import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cosmetic } from './cosmetics.entity';
import { UserCosmetic } from './user-cosmetic.entity';
import { User } from '../user/user.entity';

@Injectable()
export class CosmeticsService {
    constructor(
        @InjectRepository(Cosmetic)
        private readonly cosmeticRepo: Repository<Cosmetic>,
        @InjectRepository(UserCosmetic)
        private readonly userCosmeticRepo: Repository<UserCosmetic>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    // Crear un nuevo cosmético (para administradores)
    async createCosmetic(name: string, description: string, cost: number, imageUrl: string) {
        const cosmetic = this.cosmeticRepo.create({
            name,
            description,
            cost,
            imageUrl
        });
        return await this.cosmeticRepo.save(cosmetic);
    }

    // Crear conjuntos de ejemplo (para testing)
    async createSampleOutfits() {
        const sampleOutfits = [
            {
                name: "Outfit Básico",
                description: "El conjunto por defecto para todos los niños",
                cost: 0,
                imageUrl: "/images/outfits/default.png"
            },
            {
                name: "Outfit Casual",
                description: "Ropa cómoda para el día a día",
                cost: 100,
                imageUrl: "/images/outfits/casual.png"
            },
            {
                name: "Traje de Superhéroe",
                description: "¡Conviértete en un superhéroe!",
                cost: 200,
                imageUrl: "/images/outfits/superhero.png"
            },
            {
                name: "Traje de Astronauta",
                description: "Explora el espacio con este traje espacial",
                cost: 300,
                imageUrl: "/images/outfits/astronaut.png"
            },
            {
                name: "Vestido de Princesa",
                description: "Un hermoso vestido de princesa",
                cost: 250,
                imageUrl: "/images/outfits/princess.png"
            },
            {
                name: "Conjunto Deportivo",
                description: "Perfecto para hacer ejercicio",
                cost: 150,
                imageUrl: "/images/outfits/sports.png"
            }
        ];        const createdOutfits: Cosmetic[] = [];
        
        for (const outfit of sampleOutfits) {
            // Verificar si ya existe
            const existing = await this.cosmeticRepo.findOne({ 
                where: { name: outfit.name } 
            });
            
            if (!existing) {
                const cosmetic = this.cosmeticRepo.create(outfit);
                const saved = await this.cosmeticRepo.save(cosmetic);
                createdOutfits.push(saved);
            }
        }

        return {
            message: `Created ${createdOutfits.length} sample outfits`,
            outfits: createdOutfits.map(o => ({ id: o.id, name: o.name, cost: o.cost }))
        };
    }

    // Ver tienda de cosméticos disponibles
    async getShop(userName: string) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new Error('Child not found');
        }

        // Obtener todos los cosméticos activos
        const allCosmetics = await this.cosmeticRepo.find({
            where: { isActive: true },
            order: { cost: 'ASC' }
        });

        // Obtener cosméticos que ya tiene el usuario
        const userCosmetics = await this.userCosmeticRepo.find({
            where: { user: { id: user.id } },
            relations: ['cosmetic']
        });

        const ownedCosmeticIds = userCosmetics.map(uc => uc.cosmetic.id);

        // Crear lista de cosméticos con información adicional
        return allCosmetics.map(cosmetic => ({
            id: cosmetic.id,
            name: cosmetic.name,
            description: cosmetic.description,
            cost: cosmetic.cost,
            imageUrl: this.buildImageUrl(cosmetic.imageUrl),
            owned: ownedCosmeticIds.includes(cosmetic.id),
            canAfford: user.availablePoints >= cosmetic.cost && !ownedCosmeticIds.includes(cosmetic.id)
        }));
    }

    // Comprar un cosmético
    async buyCosmetic(userName: string, cosmeticId: number) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new HttpException('Child not found',404);
        }

        const cosmetic = await this.cosmeticRepo.findOne({ where: { id: cosmeticId } });
        if (!cosmetic) {
            throw new HttpException('Cosmetic not found',404);
        }

        // Verificar si ya lo tiene
        const existingPurchase = await this.userCosmeticRepo.findOne({
            where: { user: { id: user.id }, cosmetic: { id: cosmeticId } }
        });

        if (existingPurchase) {
            throw new HttpException('You already own this outfit',400);
        }

        // Verificar si tiene suficientes puntos
        if (user.availablePoints < cosmetic.cost) {
            throw new HttpException(`You need ${cosmetic.cost - user.availablePoints} more points`, 400);
        }

        // Realizar la compra
        user.availablePoints -= cosmetic.cost;
        await this.userRepo.save(user);

        // Crear registro de compra
        const userCosmetic = this.userCosmeticRepo.create({
            user,
            cosmetic,
            isEquipped: false
        });
        await this.userCosmeticRepo.save(userCosmetic);

        return {
            message: `¡Compraste ${cosmetic.name} por ${cosmetic.cost} puntos!`,
            remainingPoints: user.availablePoints,
            outfit: cosmetic.name
        };
    }

    // Equipar un conjunto de ropa
    async equipOutfit(userName: string, cosmeticId: number) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new Error('Child not found');
        }

        // Verificar que el usuario tiene este cosmético
        const userCosmetic = await this.userCosmeticRepo.findOne({
            where: { user: { id: user.id }, cosmetic: { id: cosmeticId } },
            relations: ['cosmetic']
        });

        if (!userCosmetic) {
            throw new Error('You do not own this outfit');
        }

        // Desequipar cualquier otro conjunto (solo uno a la vez)
        await this.userCosmeticRepo.update(
            { user: { id: user.id } },
            { isEquipped: false }
        );

        // Equipar el nuevo conjunto
        userCosmetic.isEquipped = true;
        await this.userCosmeticRepo.save(userCosmetic);

        return {
            message: `¡Ahora llevas puesto ${userCosmetic.cosmetic.name}!`,
            equippedOutfit: userCosmetic.cosmetic.name
        };
    }

    // Ver perfil del niño con su outfit actual
    async getChildProfile(userName: string) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new Error('Child not found');
        }

        // Buscar outfit equipado
        const equippedOutfit = await this.userCosmeticRepo.findOne({
            where: { user: { id: user.id }, isEquipped: true },
            relations: ['cosmetic']
        });

        // Contar cosméticos totales del usuario
        const totalOutfits = await this.userCosmeticRepo.count({
            where: { user: { id: user.id } }
        });

        return {
            name: user.name,
            totalPoints: user.totalPoints,
            availablePoints: user.availablePoints,
            totalOutfits: totalOutfits,
            currentOutfit: equippedOutfit ? {
                name: equippedOutfit.cosmetic.name,
                imageUrl: this.buildImageUrl(equippedOutfit.cosmetic.imageUrl)
            } : {
                name: "Outfit Básico",
                imageUrl: this.buildImageUrl("/images/outfits/default.png")
            }
        };
    }

    // Ver inventario de cosméticos del niño
    async getChildInventory(userName: string) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new Error('Child not found');
        }

        const userCosmetics = await this.userCosmeticRepo.find({
            where: { user: { id: user.id } },
            relations: ['cosmetic'],
            order: { purchaseDate: 'DESC' }
        });

        return userCosmetics.map(uc => ({
            id: uc.cosmetic.id,
            name: uc.cosmetic.name,
            description: uc.cosmetic.description,
            imageUrl: this.buildImageUrl(uc.cosmetic.imageUrl),
            isEquipped: uc.isEquipped,
            purchaseDate: uc.purchaseDate
        }));
    }

    // Método privado para construir URLs completas de imágenes
    private buildImageUrl(relativePath: string): string {
        // Si ya es una URL completa, la devolvemos tal como está
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
        }
        
        // Construir URL completa para archivos estáticos
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        
        // Asegurar que el path empiece con /
        const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
        
        return `${baseUrl}${cleanPath}`;
    }
}
