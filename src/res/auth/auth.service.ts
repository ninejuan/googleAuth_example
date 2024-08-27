import { Injectable, Logger } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

const fakeUsers = [
    {
        id: 1,
        username: 'LpPjv@example.com',
        password: '12345'
    },
    {
        id: 2,
        username: 'abc@example.com',
        password: '12345'
    }
]
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private jwtService: JwtService,
        @InjectRepository(User) private readonly userRepo: Repository<User>
    ) {}
    async validateUser({username, password}: AuthPayloadDto) {
        console.log('bro', username);
        const findUser = await this.userRepo.findOneBy({email: username});
        this.logger.log({findUser})
        // findUser.
        // const findUser = fakeUsers.find(user => user.username === username);
        if(!findUser) return null;
        if(password === findUser.password) {
            const {password, ...user} = findUser;
            return this.generateToken(user);
        }
    }
    async generateToken(data: any) {
        console.log({data});
        return this.jwtService.sign(data);
    }
    async findUserByEmail(email: string) {
        const user = await this.userRepo.findOneBy({email})
        return user
    }
    async createUser(userDto: CreateUserDto) {
        console.log({userDto})
        const newUser = this.userRepo.create(userDto)
        return this.userRepo.save(newUser)
    }
}
