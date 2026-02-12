import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/_common/prisma/prisma.service";
import { Prisma } from "src/generated/prisma/client";

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Find many products with pagination and filtering
   * @public - No role restriction
   */
  async findMany(
    where?: Prisma.ProductWhereInput,
    skip: number = 0,
    take: number = 20,
  ) {
    return this.prismaService.product.findMany({
      where,
      skip,
      take,
      include: {
        category: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  /**
   * Count products matching filter
   * @public - No role restriction
   */
  async count(where: Prisma.ProductWhereInput = {}) {
    return this.prismaService.product.count({ where });
  }

  /**
   * Find product by ID with category
   * @internal - Used by other services and admin endpoints
   */
  async findById(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return product;
  }

  /**
   * Find product by slug with category
   * @public - No role restriction
   */
  async findBySlug(slug: string) {
    const product = await this.prismaService.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
  }

  /**
   * Check if product has sufficient stock
   * @public - No role restriction (used during checkout)
   * Returns boolean for cart validation
   */
  async hasStock(id: string, quantity: number): Promise<boolean> {
    const product = await this.findById(id);
    return product.stock >= quantity;
  }

  /**
   * Reduce stock when order is approved
   * @internal - Called by OrdersService.approveOrder() ONLY
   * SECURITY: Stock reduction happens ONLY on approval, not on creation
   * This prevents stock manipulation via failed order attempts
   */
  async reduceStock(productId: string, quantity: number) {
    const product = await this.findById(productId);

    // Safety check: Ensure stock won't go negative
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}, Required: ${quantity}`,
      );
    }

    return this.prismaService.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  /**
   * Create new product
   * @admin-only - Requires ADMIN or SUPER_ADMIN role
   * Validates: Unique name and slug, Valid category, Positive price and stock
   */
  async create(payload: {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    category_id: string;
  }) {
    // Validate inputs
    this._validateProductPayload(payload);

    // Check slug is unique
    const slugExists = await this.prismaService.product.findUnique({
      where: { slug: payload.slug },
    });

    if (slugExists) {
      throw new BadRequestException(
        `Product slug "${payload.slug}" already exists`,
      );
    }

    // Verify category exists
    const category = await this.prismaService.category.findUnique({
      where: { id: payload.category_id },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID "${payload.category_id}" not found`,
      );
    }

    return this.prismaService.product.create({
      data: payload,
      include: {
        category: true,
      },
    });
  }

  /**
   * Update product details
   * @admin-only - Requires ADMIN or SUPER_ADMIN role
   * Allows partial updates, validates changes
   */
  async update(
    id: string,
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
    const product = await this.findById(id);

    // Validate inputs if provided
    if (payload.price !== undefined && payload.price <= 0) {
      throw new BadRequestException("Price must be greater than 0");
    }

    if (payload.stock !== undefined && payload.stock < 0) {
      throw new BadRequestException("Stock cannot be negative");
    }

    // Check slug is unique if being updated
    if (payload.slug && payload.slug !== product.slug) {
      const slugExists = await this.prismaService.product.findUnique({
        where: { slug: payload.slug },
      });

      if (slugExists) {
        throw new BadRequestException(
          `Product slug "${payload.slug}" already exists`,
        );
      }
    }

    // Verify category exists if being updated
    if (payload.category_id && payload.category_id !== product.category_id) {
      const category = await this.prismaService.category.findUnique({
        where: { id: payload.category_id },
      });

      if (!category) {
        throw new BadRequestException(
          `Category with ID "${payload.category_id}" not found`,
        );
      }
    }

    return this.prismaService.product.update({
      where: { id },
      data: payload,
      include: {
        category: true,
      },
    });
  }

  /**
   * Delete product permanently
   * @super-admin-only - Requires SUPER_ADMIN role only
   * Warning: Cannot be undone, removes product from all orders
   */
  async delete(id: string) {
    const product = await this.findById(id);

    // Check if product has associated orders
    const orderItemCount = await this.prismaService.orderItem.count({
      where: { product_id: id },
    });

    if (orderItemCount > 0) {
      throw new BadRequestException(
        `Cannot delete product "${product.name}" as it is referenced in ${orderItemCount} order(s). Archive instead or contact support.`,
      );
    }

    return this.prismaService.product.delete({
      where: { id },
    });
  }

  /**
   * Helper: Validate product payload
   * @private
   */
  private _validateProductPayload(payload: {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    category_id: string;
  }) {
    if (!payload.name || payload.name.trim().length === 0) {
      throw new BadRequestException("Product name is required");
    }

    if (!payload.slug || payload.slug.trim().length === 0) {
      throw new BadRequestException("Product slug is required");
    }

    if (payload.price === undefined || payload.price <= 0) {
      throw new BadRequestException("Product price must be greater than 0");
    }

    if (payload.stock === undefined || payload.stock < 0) {
      throw new BadRequestException("Product stock cannot be negative");
    }

    if (!payload.image_url || payload.image_url.trim().length === 0) {
      throw new BadRequestException("Product image URL is required");
    }

    if (!payload.category_id || payload.category_id.trim().length === 0) {
      throw new BadRequestException("Category ID is required");
    }
  }
}
