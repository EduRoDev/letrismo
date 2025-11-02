import { Injectable } from '@nestjs/common';
import { Level } from './levels.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LevelsService {
    constructor(
        @InjectRepository(Level)
        private readonly levelRepo: Repository<Level>
    ) {}

    async create(levelNumber: number, description: string) {
        const existing = await this.levelRepo.findOne({ where: { levelNumber } });
        if (existing) {
            throw new Error('Level with this number already exists');
        }

        const level = this.levelRepo.create({ levelNumber, description });
        return await this.levelRepo.save(level);
    }

    async findAll() {
        return await this.levelRepo.find({
            order: { levelNumber: 'ASC' },
            relations: ['words', 'progress']
        });
    }

    async findLevel(levelNumber: number) {
        const level = await this.levelRepo.findOne({ 
            where: { levelNumber }, 
            relations: ['words', 'progress'] 
        });
        if (!level) {
            throw new Error('Level not found');
        }
        return level;
    }

    async editLevel(id: number, description: string) {
        const level = await this.levelRepo.findOne({ where: { id } });
        if (!level) {
            throw new Error('Level not found');
        }
        level.description = description;
        return await this.levelRepo.save(level);
    }

    async remove(id: number) {
        const level = await this.levelRepo.findOne({ where: { id } });
        if (!level) {
            throw new Error('Level not found');
        }
        await this.levelRepo.remove(level);
        return { message: 'Level removed successfully' };
    }
}
