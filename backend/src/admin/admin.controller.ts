import { Controller, Get, HttpCode, Query } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Roles } from "src/_common/decorators/roles.decorator";
import { ResponseService } from "src/_common/response/response.service";
import { EUserRole } from "src/types";

@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly responseService: ResponseService,
  ) {}

  /**
   * @Roles(ADMIN, SUPER_ADMIN)
   * Get dashboard analytics
   * Returns: total orders, products, categories, revenue, pending/approved counts
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Get("analytics")
  async getAnalytics() {
    const data = await this.adminService.getAnalytics();
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN)
   * Get all orders with pagination
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Get("orders")
  async getOrders(@Query("skip") skip?: string, @Query("take") take?: string) {
    const data = await this.adminService.getOrders(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 50,
    );
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN)
   * Get all products with pagination
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Get("products")
  async getProducts(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
  ) {
    const data = await this.adminService.getProducts(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 50,
    );
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN)
   * Get all categories
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Get("categories")
  async getCategories() {
    const data = await this.adminService.getCategories();
    return this.responseService.success(data);
  }
}
