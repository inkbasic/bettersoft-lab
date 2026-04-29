import { Controller, Get, Param, HttpCode, Body, Post, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller("products")
export class ProductsController {
  constructor(private readonly appService: ProductsService) { }

  @Get()
  @HttpCode(200)
  getAllProducts(): Promise<any> {
    return this.appService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  getProductById(@Param('id') id: string) {
    return this.appService.findOne(Number(id));
  }

  @Post()
  @HttpCode(201)
  createProduct(@Body() body: CreateProductDto): Promise<any> {
    return this.appService.create(body);
  }

  @Put(':id')
  @HttpCode(204)
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.appService.update(Number(id), body);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteProduct(@Param('id') id: string) {
    return this.appService.deleteByID(Number(id));
  }
}
