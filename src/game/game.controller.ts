import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) { }

    @Post('start')
    async startGame(@Body() body: { userName: string; levelNumber: number }) {
        return await this.gameService.startGame(body.userName, body.levelNumber);
    }

    @Post('check-answer')
    async checkAnswer(@Body() body: {
        sessionId: number;
        wordId: number;
        userAnswer: string
    }) {
        return await this.gameService.checkAnswer(
            body.sessionId,
            body.wordId,
            body.userAnswer
        );
    }

    @Post('finish/:sessionId')
    async finishGame(@Param('sessionId') sessionId: number) {
        return await this.gameService.finishGame(sessionId);
    }

    @Get('status/:sessionId')
    async getGameStatus(@Param('sessionId') sessionId: number) {
        return await this.gameService.getGameStatus(sessionId);
    }  
      
    @Get('history/:userName')
    async getChildHistory(@Param('userName') userName: string) {
        return await this.gameService.getChildGameHistory(userName);
    }
}
