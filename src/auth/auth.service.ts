import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { UserDBService } from '../common/db_services/users/userDB.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { EmailService } from "../common/util_services/email.service";
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private userDBService: UserDBService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userDBService.get({
      username: username
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.verified) {
        const challenge_url = `${process.env.FRONTEND_URL}api/auth/confirm/${user.challenge}`;
        await this.emailService.sendChallenge(user.username, user.name, challenge_url);
        throw new ForbiddenException('Email not verified. Please check your inbox! If you did not receive an email, please check your spam folder. If you still cannot find it, please contact us.');
      }

      const { password, ...result } = user;
      return result;
    }
    throw new ForbiddenException('Invalid username or password');
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: any) {
    const payload = { username: user.username, name: user.name, password: user.password };
    try {
      const userDB = await this.userDBService.create(payload);
      const challenge_url = `${process.env.FRONTEND_URL}api/auth/confirm/${userDB.challenge}`;
      await this.emailService.sendChallenge(user.username, user.name, challenge_url);
      return { message: "Please confirm you email address by clicking the link that was sent to your inbox. If you did not receive an email, please check your spam folder. If you still cannot find it, try to log in to receive another confirmation mail!" };

    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException('Unable to create user');
      }
    }
  }

  async confirm(challenge: string) {
    const user = await this.userDBService.get({
      challenge: challenge,
    });
    if (user && !user.verified) {
      await this.userDBService.update({
        where: { challenge },
        data: { verified: true },
      })
      return true
    }
    throw new NotFoundException('Email already verified or challenge not found');
  }
}
