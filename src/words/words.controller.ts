import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
    constructor(
        private readonly wordService: WordsService
    ) { }

    @Post('/create')
    @UseInterceptors(FileInterceptor('image', {
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                return callback(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024 
        }
    }))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body('text') text: string, 
        @Body('levelId') levelId: string
    ) {
        if (!file) {
            throw new BadRequestException('Se requiere una imagen');
        }

        const word = await this.wordService.create(text, Number(levelId), file);
        if (!word) {
            throw new HttpException('Failed to create word', 400);
        }
        return {
            message: 'Word created successfully',
            data: word
        };
    }

    @Get('/all')
    async findAll() {
        const words = await this.wordService.findAll();
        return {
            message: 'Words retrieved successfully',
            data: words
        };
    }

    @Get('/find/:text')
    async findWord(@Param('text') text: string) {
        const word = await this.wordService.findWord(text);
        return {
            message: 'Word retrieved successfully',
            data: word,
        };
    }


    @Patch('/edit/:id')
    @UseInterceptors(FileInterceptor('image', {
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                return callback(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024 
        }
    }))
    async editWord(
        @Param('id') id: number,
        @Body('newText') newText: string,
        @UploadedFile() file?: Express.Multer.File
    ) {
        const word = await this.wordService.editWord(id, newText, file);
        if (!word) {
            throw new HttpException('Failed to update word', 400);
        }

        return {
            message: 'Word updated successfully',
            data: word
        };
    }

    @Delete('/delete/:id')
    async remove(@Param('id') id: number) {
        const result = await this.wordService.remove(id);
        return {
            message: result.message
        };
    }
}
