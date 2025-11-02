import { Module } from '@nestjs/common';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from './words.entity';
import { Level } from 'src/levels/levels.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Word, Level])],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService]
})
export class WordsModule {}
