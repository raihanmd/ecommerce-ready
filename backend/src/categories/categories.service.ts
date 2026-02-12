import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/_common/prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Find all categories
   * @public - No role restriction
   */
  async findAll() {
    return this.prismaService.category.findMany({
      orderBy: {
        created_at: "asc",
      },
    });
  }

  /**
   * Find category by slug with related products
   * @public - No role restriction
   */
  async findBySlug(slug: string) {
    const category = await this.prismaService.category.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  /**
   * Find category by ID (internal use)
   * @internal - Used by other services
   */
  async findById(id: string) {
    return this.prismaService.category.findUnique({
      where: { id },
    });
  }

  /**
   * Create new category
   * @admin-only - Requires ADMIN or SUPER_ADMIN role
   * Validates: Unique name, Valid slug format
   */
  async create(payload: { name: string; description?: string }) {
    // Validate name is unique
    const existing = await this.prismaService.category.findFirst({
      where: { name: { mode: "insensitive", equals: payload.name } },
    });

    if (existing) {
      throw new BadRequestException(
        `Category "${payload.name}" already exists`,
      );
    }

    // Generate slug from name
    const slug = this._generateSlug(payload.name);

    // Check slug is unique
    const slugExists = await this.prismaService.category.findUnique({
      where: { slug },
    });

    if (slugExists) {
      throw new BadRequestException(`Slug "${slug}" is already taken`);
    }

    return this.prismaService.category.create({
      data: {
        name: payload.name,
        slug,
        description: payload.description || null,
      },
    });
  }

  /**
   * Update category details
   * @admin-only - Requires ADMIN or SUPER_ADMIN role
   * Validates: Category exists, No duplicate name/slug
   */
  async update(id: string, payload: { name?: string; description?: string }) {
    const category = await this._validateCategoryExists(id);

    // If name is being updated, validate uniqueness
    if (payload.name && payload.name !== category.name) {
      const existing = await this.prismaService.category.findFirst({
        where: { name: { mode: "insensitive", equals: payload.name } },
      });

      if (existing) {
        throw new BadRequestException(
          `Category "${payload.name}" already exists`,
        );
      }
    }

    return this.prismaService.category.update({
      where: { id },
      data: {
        ...(payload.name && { name: payload.name }),
        ...(payload.description !== undefined && {
          description: payload.description,
        }),
      },
    });
  }

  /**
   * Delete category permanently
   * @super-admin-only - Requires SUPER_ADMIN role only
   * Safety: Checks if category has products before deletion
   */
  async delete(id: string) {
    // Check if category has products
    const productCount = await this.prismaService.product.count({
      where: { category_id: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${productCount} products. Please remove products first or reassign them.`,
      );
    }

    return this.prismaService.category.delete({
      where: { id },
    });
  }

  /**
   * Helper: Validate category exists
   * @private
   */
  private async _validateCategoryExists(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  /**
   * Helper: Generate slug from name
   * @private
   */
  private _generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
