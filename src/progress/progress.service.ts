import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Progress } from './progress.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Level } from 'src/levels/levels.entity';

@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(Progress)
        private readonly progressRepo: Repository<Progress>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Level)
        private readonly levelRepo: Repository<Level>,
    ) {}

    // Guardar o actualizar progreso de un niño en un nivel
    async saveProgress(userName: string, levelNumber: number, score: number, isComplete: boolean = false) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new Error('Child not found');
        }

        const level = await this.levelRepo.findOne({ where: { levelNumber } });
        if (!level) {
            throw new Error('Level not found');
        }

        // Buscar si ya existe progreso para este niño en este nivel
        let progress = await this.progressRepo.findOne({
            where: { user: { id: user.id }, level: { id: level.id } },
            relations: ['user', 'level']
        });

        if (progress) {
            // Actualizar progreso existente (solo si el nuevo score es mejor)
            if (score > progress.score || isComplete) {
                progress.score = score;
                progress.complete = isComplete;
            }
        } else {
            // Crear nuevo progreso
            progress = this.progressRepo.create({
                user,
                level,
                score,
                complete: isComplete
            });
        }

        return await this.progressRepo.save(progress);
    }

    // Obtener todo el progreso de un niño
    async getChildProgress(userName: string) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new Error('Child not found');
        }

        return await this.progressRepo.find({
            where: { user: { id: user.id } },
            relations: ['level'],
            order: { level: { levelNumber: 'ASC' } }
        });
    }

    // Verificar si un niño completó un nivel específico
    async isLevelCompleted(userName: string, levelNumber: number) {
        const progress = await this.progressRepo.findOne({
            where: { 
                user: { name: userName }, 
                level: { levelNumber },
                complete: true 
            }
        });
        return !!progress;
    }

    // Obtener el siguiente nivel disponible para un niño
    async getNextLevel(userName: string) {
        const completedLevels = await this.progressRepo.find({
            where: { user: { name: userName }, complete: true },
            relations: ['level'],
            order: { level: { levelNumber: 'DESC' } }
        });

        if (completedLevels.length === 0) {
            // Primer nivel si no ha completado ninguno
            return await this.levelRepo.findOne({ 
                where: { levelNumber: 1 },
                relations: ['words']
            });
        }

        const lastCompletedLevel = completedLevels[0].level.levelNumber;
        const nextLevelNumber = lastCompletedLevel + 1;

        return await this.levelRepo.findOne({ 
            where: { levelNumber: nextLevelNumber },
            relations: ['words']
        });
    }

    // Obtener estadísticas generales de un niño
    async getChildStats(userName: string) {
        const user = await this.userRepo.findOne({ where: { name: userName } });
        if (!user) {
            throw new Error('Child not found');
        }

        const allProgress = await this.progressRepo.find({
            where: { user: { id: user.id } },
            relations: ['level']
        });

        const totalLevels = await this.levelRepo.count();
        const completedLevels = allProgress.filter(p => p.complete).length;
        const totalScore = allProgress.reduce((sum, p) => sum + p.score, 0);

        return {
            childName: userName,
            totalLevels,
            completedLevels,
            totalScore,
            progressPercentage: totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0
        };
    }
}
