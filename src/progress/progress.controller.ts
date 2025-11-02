import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) {}

    // Guardar progreso de un niño
    @Post('save')
    async saveProgress(@Body() body: { 
        userName: string; 
        levelNumber: number; 
        score: number; 
        isComplete?: boolean 
    }) {
        return await this.progressService.saveProgress(
            body.userName,
            body.levelNumber,
            body.score,
            body.isComplete || false
        );
    }

    // Obtener progreso completo de un niño
    @Get('child/:userName')
    async getChildProgress(@Param('userName') userName: string) {
        return await this.progressService.getChildProgress(userName);
    }

    // Verificar si un nivel está completado
    @Get('completed/:userName/:levelNumber')
    async isLevelCompleted(
        @Param('userName') userName: string,
        @Param('levelNumber') levelNumber: number
    ) {
        const completed = await this.progressService.isLevelCompleted(userName, +levelNumber);
        return { userName, levelNumber: +levelNumber, completed };
    }

    // Obtener siguiente nivel disponible
    @Get('next-level/:userName')
    async getNextLevel(@Param('userName') userName: string) {
        return await this.progressService.getNextLevel(userName);
    }

    // Obtener estadísticas del niño
    @Get('stats/:userName')
    async getChildStats(@Param('userName') userName: string) {
        return await this.progressService.getChildStats(userName);
    }
}
