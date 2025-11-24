import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, BadRequestException, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CosmeticsService } from './cosmetics.service';

@Controller('cosmetics')
export class CosmeticsController {
    constructor(private readonly cosmeticsService: CosmeticsService) {}

    @Post('create')
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
    async createCosmetic(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: {
            name: string;
            description: string;
            cost: number;
        }
    ) {
        if (!file) {
            throw new BadRequestException('Se requiere una imagen');
        }

        return await this.cosmeticsService.createCosmetic(
            body.name,
            body.description,
            Number(body.cost),
            file
        );
    }

    @Post('create-samples')
    async createSampleOutfits() {
        return await this.cosmeticsService.createSampleOutfits();
    }

    @Patch('edit/:id')
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
    async editCosmetic(
        @Param('id') id: number,
        @UploadedFile() file?: Express.Multer.File,
        @Body('name') name?: string,
        @Body('description') description?: string,
        @Body('cost') cost?: string
    ) {
        return await this.cosmeticsService.editCosmetic(
            Number(id),
            name,
            description,
            cost ? Number(cost) : undefined,
            file
        );
    }

    @Get('shop/:userName')
    async getShop(@Param('userName') userName: string) {
        return await this.cosmeticsService.getShop(userName);
    }

    @Post('buy')
    async buyCosmetic(@Body() body: {
        userName: string;
        cosmeticId: number;
    }) {
        return await this.cosmeticsService.buyCosmetic(body.userName, body.cosmeticId);
    }

    @Post('equip')
    async equipOutfit(@Body() body: {
        userName: string;
        cosmeticId: number;
    }) {
        return await this.cosmeticsService.equipOutfit(body.userName, body.cosmeticId);
    }

    @Get('profile/:userName')
    async getChildProfile(@Param('userName') userName: string) {
        return await this.cosmeticsService.getChildProfile(userName);
    }

    @Get('inventory/:userName')
    async getChildInventory(@Param('userName') userName: string) {
        return await this.cosmeticsService.getChildInventory(userName);
    }
}
