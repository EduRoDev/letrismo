import { HttpException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) { }

    async create(name: string) {
        const existing = await this.userRepo.findOne({ where: { name } });
        if (existing) {
            throw new HttpException('User already exists', 400);
        }

        const user = this.userRepo.create({ name });
        return await this.userRepo.save(user);
    }


    async findAll() {
        return await this.userRepo.find();
    }

    async findUser(name: string) {
        const user = await this.userRepo.findOne({ where: { name } });
        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async remove(id: number) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new Error('User not found');
        }
        await this.userRepo.remove(user);
        return { message: 'User removed successfully' };
    }


}
