import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
    constructor(
        private readonly wordService: WordsService
    ) { }

    @Post('/create')
    async create(@Body('text') text: string, @Body('levelId') levelId: number) {
        const word = await this.wordService.create(text, levelId);
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
    async editWord(@Param('id') id: number, @Body('newText') newText: string) {
        const word = await this.wordService.editWord(id, newText);
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
