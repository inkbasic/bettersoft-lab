import { Controller, Get, Param, HttpCode, Body, Post, Put, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-categories.dto';
import { UpdateCategoryDto } from './dto/update-categories.dto';

@Controller("categories")
export class CategoriesController {
  constructor(private readonly appService: CategoriesService) { }

  @Get()
  @HttpCode(200)
  getAllCategories(): Promise<any> {
    return this.appService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  getCategiryById(@Param('id') id: string) {
    return this.appService.findOne(Number(id));
  }

  @Post()
  @HttpCode(201)
  createProduct(@Body() body: CreateCategoryDto): Promise<any> {
    return this.appService.create(body);
  }

  @Put(':id')
  @HttpCode(204)
  updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.appService.update(Number(id), body);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteCategoryByID(@Param('id') id: string) {
    return this.appService.deleteByID(Number(id));
  }
}
