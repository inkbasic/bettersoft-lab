import { BadRequestException, Controller, Get, Param, HttpCode, Body, Post, Put, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  createProduct(@Body() body: CreateProductDto): Promise<any> {
    return this.appService.create(body);
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.appService.update(Number(id), body);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  deleteProduct(@Param('id') id: string) {
    return this.appService.deleteByID(Number(id));
  }

  @Put(':id/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
  }))
  uploadProductFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ message: 'File is required' });
    }
    return this.appService.attachFileUrl(Number(id), `/uploads/${file.filename}`);
  }

  @Put(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const isImage = file.mimetype === 'image/png' || file.mimetype === 'image/jpeg';
      if (!isImage) {
        return cb(new BadRequestException({ message: 'Only png/jpg images are allowed' }), false);
      }
      cb(null, true);
    },
  }))
  uploadProductImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ message: 'File is required' });
    }
    return this.appService.attachFileUrl(Number(id), `/uploads/${file.filename}`);
  }
}
