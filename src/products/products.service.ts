import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
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
      throw new UnprocessableEntityException({ message: 'Incomplete data', error: 'Missing or invalid required fields' });
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
    const existing = await this.productsRepo.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException({ message: 'Product not found' });
    }
    const oldFileUrl = existing.file_url;
    const result = await this.productsRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException({ message: 'Product not found' });
    }
    await this.deleteOldUpload(oldFileUrl);
    return;
  }

  async attachFileUrl(id: number, fileUrl: string) {
    const entity = await this.productsRepo.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException({ message: 'Product not found' });
    }
    const oldFileUrl = entity.file_url;
    entity.file_url = fileUrl;
    const saved = await this.productsRepo.save(entity);
    await this.deleteOldUpload(oldFileUrl, fileUrl);
    return saved;
  }

  private async deleteOldUpload(oldFileUrl?: string, newFileUrl?: string) {
    if (!oldFileUrl || oldFileUrl === newFileUrl) {
      return;
    }
    if (!oldFileUrl.startsWith('/uploads/')) {
      return;
    }
    const fileName = basename(oldFileUrl);
    const filePath = join(process.cwd(), 'uploads', fileName);
    try {
      await unlink(filePath);
    } catch (err) {
      const error = err as { code?: string };
      if (error.code !== 'ENOENT') {
        throw err;
      }
    }
  }

}