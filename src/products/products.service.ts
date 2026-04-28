import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  findAll() {
    return this.productsRepo.find();
  }

  findOne(id: number) {
    return this.productsRepo.findOneBy({ id });
  }

  create(data: Partial<Product>) {
    const entity = this.productsRepo.create(data);
    return this.productsRepo.save(entity);
  }

  update(id: number, data: Partial<Product>) {
    return this.productsRepo.update(id, data);
  }

  delete(id: number) {
    return this.productsRepo.delete(id);
  }

}