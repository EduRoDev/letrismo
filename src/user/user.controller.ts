import { Body, Controller, Get, HttpException, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @Post('/create')
    async create(@Body('name') name: string) {
        if (!name) {
            throw new HttpException('Name is required', 400);
        }

        try {
            const user = this.userService.create(name);
            if (!user) {
                throw new Error('User creation failed');
            }
            return user
        } catch (error) {
            throw new HttpException(error.message, 400);
        }

    }

    @Get('/all')
    async findAll(){
        return this.userService.findAll();
    }

    @Get('/find/:name')
    async findUser(@Param('name') name: string) {
        try {
            const user = await this.userService.findUser(name);
            return user;
        } catch (error) {
            throw new HttpException(error.message, 404);
        }
    }

    @Post('/remove/:id')
    async remove(@Param('id') id: number) {
        try {
            const result = await this.userService.remove(id);
            return result;
        } catch (error) {
            throw new HttpException(error.message, 404);
        }
    }
}
