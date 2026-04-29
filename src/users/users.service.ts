import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByUsername(username: string) {
    return this.usersRepo.findOneBy({ username });
  }

  async createUser(username: string, passwordHash: string) {
    const existing = await this.findByUsername(username);
    if (existing) {
      throw new ConflictException({ message: 'Username already exists' });
    }
    const entity = this.usersRepo.create({ username, password_hash: passwordHash });
    return this.usersRepo.save(entity);
  }
}
