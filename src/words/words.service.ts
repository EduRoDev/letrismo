import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Word } from './words.entity';
import { Repository } from 'typeorm';
import { Level } from 'src/levels/levels.entity';

@Injectable()
export class WordsService {
    constructor(
        @InjectRepository(Word)
        private readonly wordRepo: Repository<Word>,
        @InjectRepository(Level)
        private readonly levelRepo: Repository<Level>,
    ) {}        
    
    async create(text: string, levelId: number, imageUrl: string){
        const cleanText = text?.trim();
        
        if (!cleanText) {
            throw new Error('Text is required');
        }
        
        const existing = await this.wordRepo.findOne({ where: { text: cleanText } });
                
        if (existing) {
            throw new Error('Word already exists');
        }

        const level = await this.levelRepo.findOne({ where: { id: levelId } });
        if (!level) {
            throw new Error('Level not found');
        }

        const word = this.wordRepo.create({ text: cleanText, level, imageUrl });
        return await this.wordRepo.save(word);
    }

    async findAll(){
        return await this.wordRepo.find({relations: ['level']});
    }

    async findWord(text: string){
        const word = await this.wordRepo.findOne({ where: { text }, relations: ['level'] });
        if (!word) {
            throw new Error('Word not found');
        }
        return word;
    }

    async editWord(id: number, newText: string){
        const word = await this.wordRepo.findOne({ where: { id } });
        if (!word) {
            throw new Error('Word not found');
        }
        word.text = newText;
        return await this.wordRepo.save(word);
    }

    async remove(id: number){
        const word = await this.wordRepo.findOne({ where: { id } });
        if (!word) {
            throw new Error('Word not found');
        }
        await this.wordRepo.remove(word);
        return { message: 'Word removed successfully' };
    }
}
