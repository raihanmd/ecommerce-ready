import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  BadRequestException,
  Post,
  Body,
  Delete,
  Put,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { Public } from "src/_common/decorators/public.decorator";
import { Roles } from "src/_common/decorators/roles.decorator";
import { ResponseService } from "src/_common/response/response.service";
import { ZodValidationPipeFactory } from "src/_common/pipes/zod-validation-validation-pipe";
import { type ProductQuery, ProductQuerySchema } from "./zod";
import { EUserRole } from "src/types";
import { Prisma } from "src/generated/prisma/client";

@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly responseService: ResponseService,
  ) {}

  /**
   * @Public() - Public endpoint
   * List all products with pagination and filtering
   */
  @HttpCode(200)
  @Public()
  @Get()
  async findAll(
    @Query(ZodValidationPipeFactory(ProductQuerySchema))
    query: ProductQuery,
  ) {
    const { page, limit, category_id, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (category_id) where.category_id = category_id;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      this.productsService.findMany(where, skip, limit),
      this.productsService.count(where),
    ]);

    return this.responseService.success({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  /**
   * @Public() - Public endpoint
   * Get single product details by slug
   */
  @HttpCode(200)
  @Public()
  @Get("detail/:slug")
  async findBySlug(@Param("slug") slug: string) {
    const data = await this.productsService.findBySlug(slug);
    return this.responseService.success(data);
  }

  /**
   * @Public() - Public endpoint
   * Check if product has sufficient stock (for cart validation)
   */
  @HttpCode(200)
  @Public()
  @Get("stock-check/:id")
  async checkStock(
    @Param("id") id: string,
    @Query("quantity") quantity: string,
  ) {
    if (!quantity) {
      throw new BadRequestException("Quantity parameter is required");
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new BadRequestException("Quantity must be a positive number");
    }

    const hasStock = await this.productsService.hasStock(id, qty);
    return this.responseService.success({ hasStock });
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN) - Restricted endpoint
   * Create new product (admin only)
   * Requires: name, slug, description, price, stock, image_url, category_id
   */
  @HttpCode(201)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Post()
  async create(
    @Body()
    payload: {
      name: string;
      slug: string;
      description: string;
      price: number;
      stock: number;
      image_url: string;
      category_id: string;
    },
  ) {
    const data = await this.productsService.create(payload);
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN) - Restricted endpoint
   * Update product details (admin only)
   * Updatable fields: name, slug, description, price, stock, image_url, category_id
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body()
    payload: Partial<{
      name: string;
      slug: string;
      description: string;
      price: number;
      stock: number;
      image_url: string;
      category_id: string;
    }>,
  ) {
    const data = await this.productsService.update(id, payload);
    return this.responseService.success(data);
  }

  /**
   * @Roles(SUPER_ADMIN) - Highly restricted endpoint
   * Delete product (super admin only)
   * Cannot be undone - use with caution
   */
  @HttpCode(200)
  @Roles([EUserRole.SUPER_ADMIN])
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const data = await this.productsService.delete(id);
    return this.responseService.success(data);
  }
}
