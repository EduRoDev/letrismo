import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CosmeticsService } from './cosmetics.service';

@Controller('cosmetics')
export class CosmeticsController {
    constructor(private readonly cosmeticsService: CosmeticsService) {}    @Post('create')
    
    @Post('create')
    async createCosmetic(@Body() body: {
        name: string;
        description: string;
        cost: number;
        imageUrl: string;
    }) {
        return await this.cosmeticsService.createCosmetic(
            body.name,
            body.description,
            body.cost,
            body.imageUrl
        );
    }

    @Post('create-samples')
    async createSampleOutfits() {
        return await this.cosmeticsService.createSampleOutfits();
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
