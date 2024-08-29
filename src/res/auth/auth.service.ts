// import { Injectable, Logger } from '@nestjs/common';
// import { AuthPayloadDto } from './dto/auth.dto';
// import { JwtService } from '@nestjs/jwt';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CreateUserDto } from './dto/create-user.dto';

// const fakeUsers = [
//     {
//         id: 1,
//         username: 'LpPjv@example.com',
//         password: '12345'
//     },
//     {
//         id: 2,
//         username: 'abc@example.com',
//         password: '12345'
//     }
// ]
// @Injectable()
// export class AuthService {
//     private readonly logger = new Logger(AuthService.name);
//     constructor(
//         private jwtService: JwtService,
//         @InjectRepository(User) private readonly userRepo: Repository<User>
//     ) {}
//     async validateUser({username, password}: AuthPayloadDto) {
//         console.log('bro', username);
//         const findUser = await this.userRepo.findOneBy({email: username});
//         this.logger.log({findUser})
//         // findUser.
//         // const findUser = fakeUsers.find(user => user.username === username);
//         if(!findUser) return null;
//         if(password === findUser.password) {
//             const {password, ...user} = findUser;
//             return this.generateToken(user);
//         }
//     }
//     async generateToken(data: any) {
//         console.log({data});
//         return this.jwtService.sign(data);
//     }
//     async findUserByEmail(email: string) {
//         const user = await this.userRepo.findOneBy({email})
//         return user
//     }
//     async createUser(userDto: CreateUserDto) {
//         console.log({userDto})
//         const newUser = this.userRepo.create(userDto)
//         return this.userRepo.save(newUser)
//     }
// }
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; // Adjust the path to your User entity
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private jwtService: JwtService,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) {}

    async handleGoogleLogin(user: any) {
        const { email, firstName, lastName, picture, googleId } = user;

        // Find the user by email, or create a new one if not found
        let existingUser = await this.findUserByEmail(email);
        
        if (!existingUser) {
            const userDto: CreateUserDto = {
                email: email,
                firstName: firstName,
                lastName: lastName,
                googleId: googleId,
                picture: picture,
                username: email,
                // Add any additional fields required by your User entity
            };
            existingUser = await this.createUser(userDto);
        }

        return this.generateTokens(existingUser);
    }

    async generateTokens(user: User) {
        const payload = { id: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        // Optionally, save the refreshToken in the database for additional security checks
        // await this.saveRefreshToken(user.id, refreshToken);

        return { accessToken, refreshToken };
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken);
            const user = await this.findUserByEmail(decoded.email);

            if (!user) {
                throw new UnauthorizedException('Invalid token');
            }

            return this.generateTokens(user);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async findUserByEmail(email: string): Promise<User | undefined> {
        return this.userRepo.findOne({ where: { email } });
    }

    async createUser(userDto: CreateUserDto): Promise<User> {
        const newUser = this.userRepo.create(userDto);
        return await this.userRepo.save(newUser);
    }

    // Optional: A method to save refresh tokens to the database if you want to invalidate them later
    // async saveRefreshToken(userId: number, refreshToken: string) {
    //     await this.userRepo.update(userId, { refreshToken });
    // }
}
