import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Public } from "src/_common/decorators/public.decorator";
import { Roles } from "src/_common/decorators/roles.decorator";
import { ResponseService } from "src/_common/response/response.service";
import { ProductsService } from "./products.service";
import { ZodValidationPipeFactory } from "src/_common/pipes/zod-validation-validation-pipe";
import { type ProductQuery, ProductsValidation } from "./zod";
import { EUserRole } from "src/types";

@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly responseService: ResponseService,
  ) {}

  // ============ PUBLIC ENDPOINTS ============

  @HttpCode(200)
  @Public()
  @Get()
  async findAll(
    @Query(ZodValidationPipeFactory(ProductsValidation.QUERY))
    query: ProductQuery,
  ) {
    const data = await this.productsService.findAll(query);

    if (query.page && query.limit) {
      return this.responseService.pagination(data.data, data.pagination);
    }

    return this.responseService.success(data);
  }

  @HttpCode(200)
  @Public()
  @Get(":slug")
  async findBySlug(
    @Param(ZodValidationPipeFactory(ProductsValidation.SLUG_PARAM))
    params: {
      slug: string;
    },
  ) {
    const data = await this.productsService.findBySlug(params.slug);
    return this.responseService.success(data);
  }

  // ============ ADMIN ENDPOINTS ============

  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Post()
  async create(
    @Body(ZodValidationPipeFactory(ProductsValidation.CREATE))
    createDto: any,
  ) {
    const data = await this.productsService.create(createDto);
    return this.responseService.success(data);
  }

  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Put(":id")
  async update(
    @Param(ZodValidationPipeFactory(ProductsValidation.PARAM))
    params: { id: string },
    @Body(ZodValidationPipeFactory(ProductsValidation.UPDATE))
    updateDto: any,
  ) {
    const data = await this.productsService.update(params.id, updateDto);
    return this.responseService.success(data);
  }

  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Delete(":id")
  async delete(
    @Param(ZodValidationPipeFactory(ProductsValidation.PARAM))
    params: {
      id: string;
    },
  ) {
    const data = await this.productsService.delete(params.id);
    return this.responseService.success(data);
  }

  // ============ IMAGE UPLOAD ============

  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Post("upload-image")
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    const data = await this.productsService.uploadProductImage(image);
    return this.responseService.success(data);
  }
}
