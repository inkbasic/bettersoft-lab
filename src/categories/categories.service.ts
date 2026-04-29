import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly productsRepo: Repository<Category>,
  ) {}

  findAll() {
    return this.productsRepo.find();
  }

  async findOne(id: number) {
    const result = await this.productsRepo.findOneBy({ id });
    if (!result) {
      throw new NotFoundException({ message: 'Category not found' });
    }
    return result;
  }

  create(data: Partial<Category>) {
    if (!data.name) {
      throw new UnprocessableEntityException({ message: 'Incomplete data', error: 'Missing required field: name' });
    }
    const entity = this.productsRepo.create(data);
    return this.productsRepo.save(entity);
  }

  async update(id: number, data: Partial<Category>) {
    const entity = await this.productsRepo.preload({ id, ...data });
    if (!entity) {
      throw new NotFoundException({ message: 'Category ID not found' });
    }
    return this.productsRepo.save(entity);
  }

  async deleteByID(id: number) {
    try {
      const result = await this.productsRepo.delete(id);
      if (!result.affected) {
        throw new NotFoundException({ message: 'Category ID not found' });
      }
      return;
    } catch (err) {
      if (this.isForeignKeyViolation(err)) {
        throw new ConflictException({
          message: 'Category is in use and cannot be deleted',
          code: 'CATEGORY_IN_USE',
        });
      }
      throw err;
    }
  }

  private isForeignKeyViolation(err: unknown) {
    if (!(err instanceof QueryFailedError)) {
      return false;
    }
    const error = err as { code?: string; message?: string };
    return error.code === 'SQLITE_CONSTRAINT'
      && typeof error.message === 'string'
      && error.message.includes('FOREIGN KEY');
  }

}