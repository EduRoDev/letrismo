import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Word } from './words.entity';
import { Repository } from 'typeorm';
import { Level } from 'src/levels/levels.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class WordsService {
    constructor(
        @InjectRepository(Word)
        private readonly wordRepo: Repository<Word>,
        @InjectRepository(Level)
        private readonly levelRepo: Repository<Level>,
        private readonly cloudinaryService: CloudinaryService,
    ) {}        
    
    async create(text: string, levelId: number, file: Express.Multer.File){
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

        // Guardar temporalmente el archivo y subirlo a Cloudinary
        const tempFilePath = join(process.cwd(), 'temp', `${Date.now()}-${file.originalname}`);
        writeFileSync(tempFilePath, file.buffer);
        
        let imageUrl: string;
        try {
            imageUrl = await this.cloudinaryService.uploadImage(tempFilePath);
            // Eliminar el archivo temporal después de subirlo
            unlinkSync(tempFilePath);
        } catch (error) {
            // Asegurarse de eliminar el archivo temporal incluso si falla la subida
            try {
                unlinkSync(tempFilePath);
            } catch (e) {
                // Ignorar error si el archivo no existe
            }
            throw error;
        }

        const word = this.wordRepo.create({ text: cleanText, level, imageUrl });
        return await this.wordRepo.save(word);
    }    
    
    async findAll(){
        const words = await this.wordRepo.find({relations: ['level']});
        return words;
    }

    async findWord(text: string){
        const word = await this.wordRepo.findOne({ where: { text }, relations: ['level'] });
        if (!word) {
            throw new Error('Word not found');
        }
        return word;
    }

    async editWord(id: number, newText: string, file?: Express.Multer.File){
        const word = await this.wordRepo.findOne({ where: { id } });
        if (!word) {
            throw new Error('Word not found');
        }
        
        if (newText) {
            word.text = newText;
        }
        
        // Si se proporciona un nuevo archivo, subir a Cloudinary
        if (file) {
            const tempFilePath = join(process.cwd(), 'temp', `${Date.now()}-${file.originalname}`);
            writeFileSync(tempFilePath, file.buffer);
            
            try {
                const newImageUrl = await this.cloudinaryService.uploadImage(tempFilePath);
                word.imageUrl = newImageUrl;
                // Eliminar el archivo temporal
                unlinkSync(tempFilePath);
            } catch (error) {
                // Asegurarse de eliminar el archivo temporal incluso si falla la subida
                try {
                    unlinkSync(tempFilePath);
                } catch (e) {
                    // Ignorar error si el archivo no existe
                }
                throw error;
            }
        }
        
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
