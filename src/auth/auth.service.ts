import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const passwordHash = await bcrypt.hash(password, this.saltRounds);
    const user = await this.usersService.createUser(username, passwordHash);
    return { id: user.id, username: user.username };
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid credentials' });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException({ message: 'Invalid credentials' });
    }
    const access_token = await this.jwtService.signAsync({ sub: user.id, role: user.role });
    return {
      access_token,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }
}
