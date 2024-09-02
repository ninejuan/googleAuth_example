// import { Injectable, Logger } from '@nestjs/common';
// import { AuthPayloadDto } from './dto/auth.dto';
// import { JwtService } from '@nestjs/jwt';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CreateAuthDto } from './dto/create-user.dto';

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
//     async createUser(userDto: CreateAuthDto) {
//         console.log({userDto})
//         const newUser = this.userRepo.create(userDto)
//         return this.userRepo.save(newUser)
//     }
// }
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/interface/user.interface';
import { CreateAuthDto } from './dto/create-user.dto';
import userSchema from 'src/models/user.schema';
import { first } from 'rxjs';
import { JwtPayload } from 'src/interface/jwt-payload.interface';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private jwtService: JwtService
    ) { }

    async handleGoogleLogin(user: any) {
        const { email, firstName, lastName, picture, googleId } = user;

        // Find the user by email, or create a new one if not found
        let existingUser = await this.findUserByEmail(email);

        if (!existingUser) {
            const userDto: User = {
                google_mail: email,
                name: `${lastName} ${firstName}`,
                google_uid: googleId,
                profilePhoto: picture,
                // Add any additional fields required by your User entity
            };
            existingUser = await this.createUser(userDto);
        }

        return this.generateTokens(existingUser);
    }

    async generateTokens(user: User) {
        const payload: JwtPayload = { google_id: user.google_uid, google_mail: user.google_mail };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        await this.saveRefreshToken(user.google_mail, refreshToken);

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

    async findUserByEmail(email: string) {
        return await userSchema.findOne({ google_mail: email });
    }

    async createUser(userDto: User): Promise<User> {
        const newUser = await new userSchema(userDto).save();
        return newUser;
    }

    async saveRefreshToken(google_mail: String, refreshToken: string) {
        const user = await this.findUserByEmail(google_mail.toString());
        user.refreshToken = refreshToken;
        await user.save();
    }
}
