import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CosmeticsController } from './cosmetics.controller';
import { CosmeticsService } from './cosmetics.service';
import { Cosmetic } from './cosmetics.entity';
import { UserCosmetic } from './user-cosmetic.entity';
import { User } from '../user/user.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Cosmetic, UserCosmetic, User])
    ],
    controllers: [CosmeticsController],
    providers: [CosmeticsService, CloudinaryService],
    exports: [CosmeticsService]
})
export class CosmeticsModule {}
