import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameSession } from './game.entity';
import { User } from '../user/user.entity';
import { Level } from '../levels/levels.entity';
import { Word } from '../words/words.entity';
import { Progress } from '../progress/progress.entity';
import { ProgressModule } from '../progress/progress.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([GameSession, User, Level, Word, Progress]),
        ProgressModule
    ],
    controllers: [GameController],
    providers: [GameService],
    exports: [GameService]
})
export class GameModule {}
