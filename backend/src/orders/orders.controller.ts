import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { Public } from "src/_common/decorators/public.decorator";
import { ResponseService } from "src/_common/response/response.service";
import { ZodValidationPipeFactory } from "src/_common/pipes/zod-validation-validation-pipe";
import { type CreateOrderPayload, CreateOrderSchema } from "./zod";
import { Roles } from "src/_common/decorators/roles.decorator";
import { EUserRole } from "src/types";

@Controller("orders")
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly responseService: ResponseService,
  ) {}

  /**
   * @Public() - Public endpoint
   * Create order from shopping cart
   * Anyone can place an order without authentication
   * Payload includes customer details, items, delivery, payment info
   */
  @HttpCode(201)
  @Public()
  @Post()
  async create(
    @Body(ZodValidationPipeFactory(CreateOrderSchema))
    payload: CreateOrderPayload,
  ) {
    const data = await this.ordersService.create(payload);
    return this.responseService.success(data);
  }

  /**
   * @Public() - Public endpoint
   * Get order details by order number (for confirmation page)
   * Anyone can retrieve order with order number
   * No authentication required for customer transparency
   */
  @HttpCode(200)
  @Public()
  @Get(":order_number")
  async findByOrderNumber(@Param("order_number") orderNumber: string) {
    const data = await this.ordersService.findByOrderNumber(orderNumber);
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN) - Restricted endpoint
   * Get all orders (admin only)
   * Only admins can view all orders in the system
   * Used for order management dashboard
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Get("admin/all")
  async findAll() {
    const data = await this.ordersService.findAll();
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN) - Restricted endpoint
   * Update order status (admin only)
   * Allowed statuses: PENDING, APPROVED, REJECTED, SHIPPED, DELIVERED, CANCELLED
   * Note: Use /approve or /reject for automatic handling instead
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() payload: { status: string },
  ) {
    const data = await this.ordersService.updateStatus(id, payload.status);
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN) - Restricted endpoint
   * Approve order and automatically reduce product stock (admin only)
   * This is the primary method to confirm an order
   * Triggers: Status change to APPROVED + Stock reduction
   * SECURITY: Stock reduction ONLY happens on approval, not on creation
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Patch(":id/approve")
  async approve(@Param("id") id: string) {
    const data = await this.ordersService.approveOrder(id);
    return this.responseService.success(data);
  }

  /**
   * @Roles(ADMIN, SUPER_ADMIN) - Restricted endpoint
   * Reject order without affecting inventory (admin only)
   * Used when order cannot be fulfilled
   * Stock is NOT reduced for rejected orders (safety feature)
   */
  @HttpCode(200)
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Patch(":id/reject")
  async reject(@Param("id") id: string) {
    const data = await this.ordersService.rejectOrder(id);
    return this.responseService.success(data);
  }
}
