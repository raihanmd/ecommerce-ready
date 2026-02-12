import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { Public } from "src/_common/decorators/public.decorator";
import { Roles } from "src/_common/decorators/roles.decorator";
import { ResponseService } from "src/_common/response/response.service";
import { EUserRole } from "src/types";

@Controller("categories")
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly responseService: ResponseService,
  ) {}

  /**
   * @Public() - Public endpoint
   * List all categories for public browsing
   */
  @HttpCode(200)
  @Public()
  @Get()
  async findAll() {
    const data = await this.categoriesService.findAll();
    return this.responseService.success(data);
  }

  /**
   * @Public() - Public endpoint
   * Get category with products by slug
   */
  @HttpCode(200)
  @Public()
  @Get(":slug")
  async findBySlug(@Param("slug") slug: string) {
    const data = await this.categoriesService.findBySlug(slug);
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN) - Restricted endpoint
   * Create new category (admin only)
   */
  @HttpCode(201)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Post()
  async create(@Body() payload: { name: string; description?: string }) {
    const data = await this.categoriesService.create(payload);
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN) - Restricted endpoint
   * Update category (admin only)
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() payload: { name?: string; description?: string },
  ) {
    const data = await this.categoriesService.update(id, payload);
    return this.responseService.success(data);
  }

  /**
   * @Roles(SUPER_ADMIN) - Highly restricted endpoint
   * Delete category (super admin only)
   */
  @HttpCode(200)
  @Roles([EUserRole.SUPER_ADMIN])
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const data = await this.categoriesService.delete(id);
    return this.responseService.success(data);
  }
}
