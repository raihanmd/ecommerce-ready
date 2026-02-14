import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/_common/prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Get dashboard analytics
   * Returns: order counts, product counts, revenue
   */
  async getAnalytics() {
    // Get counts in parallel
    const [totalOrders, totalProducts, totalCategories] = await Promise.all([
      this.prismaService.order.count(),
      this.prismaService.product.count(),
      this.prismaService.category.count(),
    ]);

    // Get order statuses
    const ordersByStatus = await this.prismaService.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Get total revenue
    const totalRevenueData = await this.prismaService.order.aggregate({
      _sum: {
        total_amount: true,
      },
      where: {
        status: "APPROVED",
      },
    });

    const totalRevenue = totalRevenueData._sum.total_amount
      ? parseFloat(totalRevenueData._sum.total_amount.toString())
      : 0;

    // Extract counts by status
    const pendingOrders =
      ordersByStatus.find((o) => o.status === "PENDING")?._count.id || 0;
    const approvedOrders =
      ordersByStatus.find((o) => o.status === "APPROVED")?._count.id || 0;

    return {
      totalOrders,
      totalProducts,
      totalCategories,
      totalRevenue,
      pendingOrders,
      approvedOrders,
    };
  }

  /**
   * Get all orders with pagination
   */
  async getOrders(skip = 0, take = 50) {
    return this.prismaService.order.findMany({
      skip,
      take,
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  /**
   * Get all products with pagination
   */
  async getProducts(skip = 0, take = 50) {
    return this.prismaService.product.findMany({
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
   * Get all categories
   */
  async getCategories() {
    return this.prismaService.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }
}
