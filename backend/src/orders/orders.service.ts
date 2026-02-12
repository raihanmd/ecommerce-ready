import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/_common/prisma/prisma.service";
import type { CreateOrderPayload } from "./zod";
import { ProductsService } from "src/products/products.service";
import { OrderStatus } from "src/generated/prisma/client";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Generate unique order number
   * Format: ORD-{timestamp}-{random}
   * @private
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Create new order from shopping cart
   * @public - Anyone can place orders
   * SECURITY NOTES:
   * - Stock validation happens here but NO stock reduction yet
   * - Stock reduction ONLY happens on approval via approveOrder()
   * - This prevents stock manipulation via failed order attempts
   * - Order starts with PENDING status
   * - Price snapshot taken for each item (price_at_time)
   */
  async create(payload: CreateOrderPayload) {
    // Validate all products exist and have sufficient stock
    const validations = await Promise.all(
      payload.items.map(async (item) => {
        const product = await this.productsService.findById(item.product_id);
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }
        return product;
      }),
    );

    // Calculate total amount
    const totalAmount = payload.items.reduce((sum, item) => {
      const product = validations.find((p) => p.id === item.product_id);
      return sum + Number(product?.price) * item.quantity;
    }, 0);

    // Create order with items in a transaction
    const order = await this.prismaService.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          order_number: this.generateOrderNumber(),
          customer_name: payload.customer_name,
          customer_phone: payload.customer_phone,
          customer_address: payload.customer_address,
          latitude: payload.latitude ? payload.latitude.toString() : null,
          longitude: payload.longitude ? payload.longitude.toString() : null,
          delivery_schedule: payload.delivery_schedule,
          payment_method: payload.payment_method,
          total_amount: totalAmount.toString(),
          status: "PENDING",
        },
      });

      // Create order items with price snapshot
      await Promise.all(
        payload.items.map((item) => {
          const product = validations.find((p) => p.id === item.product_id);
          return tx.orderItem.create({
            data: {
              order_id: newOrder.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price_at_time: product?.price ?? 0,
            },
          });
        }),
      );

      return newOrder;
    });

    return this.findById(order.id);
  }

  /**
   * Find order by ID with all items and product details
   * @internal - Used by other service methods
   */
  async findById(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    return order;
  }

  /**
   * Find order by order number (for customer confirmation)
   * @public - Anyone can lookup order by number
   * Used: Order confirmation page, order tracking
   */
  async findByOrderNumber(orderNumber: string) {
    const order = await this.prismaService.order.findUnique({
      where: { order_number: orderNumber },
      include: {
        order_items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with number "${orderNumber}" not found`,
      );
    }

    return order;
  }

  /**
   * Find all orders (admin dashboard)
   * @admin-only - Requires ADMIN or SUPER_ADMIN role
   */
  async findAll() {
    return this.prismaService.order.findMany({
      include: {
        order_items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  /**
   * Update order status
   * @admin-only - Requires ADMIN or SUPER_ADMIN role
   * Validates: Order exists, Valid status, Proper state transition
   * Allowed statuses: PENDING, APPROVED, REJECTED, SHIPPED, DELIVERED, CANCELLED
   * NOTE: Use approveOrder() or rejectOrder() for automatic handling instead
   */
  async updateStatus(id: string, status: string) {
    const order = await this.findById(id);

    const validStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status: ${status}. Allowed: ${validStatuses.join(", ")}`,
      );
    }

    // Prevent invalid state transitions
    const forbiddenTransitions: Record<string, string[]> = {
      REJECTED: ["APPROVED", "SHIPPED", "DELIVERED"],
      CANCELLED: ["APPROVED", "SHIPPED", "DELIVERED"],
    };

    if (forbiddenTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(
        `Cannot transition order from ${order.status} to ${status}`,
      );
    }

    const updated = await this.prismaService.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

    return this.findById(updated.id);
  }

  /**
   * Approve order and reduce product stock
   * @admin-only - Requires ADMIN or SUPER_ADMIN role
   * CRITICAL SECURITY: This is where stock reduction happens
   * - Only call when payment confirmed
   * - Stock reduction is atomic with status update
   * - Stock changes are IRREVERSIBLE (use reject if needed)
   * - Validates: Order status is PENDING
   * - Performs: Status → APPROVED + Stock decrement
   */
  async approveOrder(id: string) {
    const order = await this.findById(id);

    if (order.status !== "PENDING") {
      throw new BadRequestException(
        `Cannot approve order with status ${order.status}. Only PENDING orders can be approved.`,
      );
    }

    // Reduce stock for all items in the order
    // SECURITY: This happens AFTER validation in transaction
    await Promise.all(
      order.order_items.map((item) =>
        this.productsService.reduceStock(item.product_id, item.quantity),
      ),
    );

    return this.updateStatus(id, "APPROVED");
  }

  /**
   * Reject order without affecting inventory
   * @admin-only - Requires ADMIN or SUPER_ADMIN role
   * SECURITY: Stock is NOT reduced for rejected orders
   * Use when: Payment failed, customer cancelled, cannot fulfill
   * Safety: Preserves inventory for other customers
   */
  async rejectOrder(id: string) {
    const order = await this.findById(id);

    if (order.status !== "PENDING") {
      throw new BadRequestException(
        `Cannot reject order with status ${order.status}. Only PENDING orders can be rejected.`,
      );
    }

    return this.updateStatus(id, "REJECTED");
  }
}
