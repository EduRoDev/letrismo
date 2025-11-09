import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { LevelsService } from './levels.service';

@Controller('levels')
export class LevelsController {
    constructor(private readonly levelsService: LevelsService) {}

    // Crear un nuevo nivel
    @Post()
    async create(@Body() body: { levelNumber: number; description: string }) {
        return await this.levelsService.create(body.levelNumber, body.description);
    }

    // Obtener todos los niveles con palabras y progreso
    @Get()
    async findAll() {
        return await this.levelsService.findAll();
    }

    // Obtener un nivel específico por número
    @Get(':levelNumber')
    async findLevel(@Param('levelNumber') levelNumber: number) {
        return await this.levelsService.findLevel(levelNumber);
    }

    // Editar descripción de un nivel
    @Put(':id')
    async editLevel(
        @Param('id') id: number,
        @Body() body: { description: string }
    ) {
        return await this.levelsService.editLevel(id, body.description);
    }

    // Eliminar un nivel
    @Delete(':id')
    async remove(@Param('id') id: number) {
        return await this.levelsService.remove(id);
    }
}
