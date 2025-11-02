import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { ProgressModule } from './progress/progress.module';
import { WordsModule } from './words/words.module';
import { LevelsModule } from './levels/levels.module';
import { GameModule } from './game/game.module';
import { CosmeticsModule } from './cosmetics/cosmetics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from './levels/levels.entity';
import { User } from './user/user.entity';
import { Progress } from './progress/progress.entity';
import { Word } from './words/words.entity';
import { GameSession } from './game/game.entity';
import { Cosmetic } from './cosmetics/cosmetics.entity';
import { UserCosmetic } from './cosmetics/user-cosmetic.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',      database: 'Letrismo',
      entities: [Level,User,Progress,Word,GameSession,Cosmetic,UserCosmetic],
      synchronize: true,
      autoLoadEntities: true,
    }),    
    
    UserModule, ProgressModule, WordsModule, LevelsModule, GameModule, CosmeticsModule],
  
})
export class AppModule { }
