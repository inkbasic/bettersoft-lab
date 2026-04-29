import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) { }

  findAll() {
    return this.productsRepo.find({ relations: { category: true } });
  }

  async findOne(id: number) {
    const result = await this.productsRepo.findOne({ where: { id }, relations: { category: true } });
    if (!result) {
      throw new NotFoundException({ message: 'Product not found' });
    }
    return result;
  }

  create(data: Partial<Product> & { category_id?: number }) {
    if (!(data.name)
      || !(data.category_id)
      || !(data.price)
      || (typeof data.quantity !== 'number')
    ) {
      throw new BadRequestException({ message: 'Incomplete data', error: 'Missing or invalid required fields', statusCode: 422 });
    }
    const { category_id, ...rest } = data;
    const entity = this.productsRepo.create({
      ...rest,
      ...(typeof category_id === 'number'
        ? { category: { id: category_id } as Category }
        : {}),
    });
    return this.productsRepo.save(entity);
  }

  async update(id: number, data: Partial<Product> & { category_id?: number }) {
    const { category_id, ...rest } = data;
    const entity = await this.productsRepo.preload({
      id,
      ...rest,
      ...(typeof category_id === 'number'
        ? { category: { id: category_id } as Category }
        : {}),
    });
    if (!entity) {
      throw new NotFoundException({ message: 'Product not found' });
    }
    return this.productsRepo.save(entity);
  }

  async deleteByID(id: number) {
    const result = await this.productsRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException({ message: 'Product not found' });
    }
    return;
  }

}