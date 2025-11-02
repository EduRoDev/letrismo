import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { Progress } from './progress.entity';
import { User } from '../user/user.entity';
import { Level } from '../levels/levels.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Progress, User, Level])
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService]
})
export class ProgressModule {}
