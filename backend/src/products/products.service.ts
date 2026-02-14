import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/_common/prisma/prisma.service";
import { ImageKitService } from "src/_common/imagekit/imagekit.service";
import { CreateProductDto, UpdateProductDto, ProductQuery } from "./zod";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imagekitService: ImageKitService,
  ) {}

  async findAll(query: ProductQuery) {
    const { page, limit, category_id, search } = query;

    // Build where clause
    const where: any = {};

    if (category_id) {
      where.category_id = category_id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.prismaService.product.findMany({
          where,
          skip,
          take: limit,
          include: {
            category: true,
          },
          orderBy: {
            created_at: "desc",
          },
        }),
        this.prismaService.product.count({ where }),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    const data = await this.prismaService.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return { data };
  }

  async findBySlug(slug: string) {
    const product = await this.prismaService.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async create(createDto: CreateProductDto) {
    // Generate slug from name if not provided
    const slug = createDto.slug || this.generateSlug(createDto.name);

    const product = await this.prismaService.product.create({
      data: {
        ...createDto,
        slug,
      },
      include: {
        category: true,
      },
    });

    return product;
  }

  async update(id: string, updateDto: UpdateProductDto) {
    // Check if product exists
    await this.findById(id);

    // Generate new slug if name changed and no slug provided
    if (updateDto.name && !updateDto.slug) {
      updateDto.slug = this.generateSlug(updateDto.name);
    }

    const product = await this.prismaService.product.update({
      where: { id },
      data: updateDto,
      include: {
        category: true,
      },
    });

    return product;
  }

  async delete(id: string) {
    // Check if product exists
    await this.findById(id);

    const product = await this.prismaService.product.delete({
      where: { id },
    });

    return product;
  }

  async findById(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  // ============ IMAGE UPLOAD ============
  async uploadProductImage(file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException("No file provided");
    }

    // Upload to ImageKit
    const result = await this.imagekitService.uploadFile(file, {
      folder: "/ecommerce/products",
      tags: ["product", "ecommerce"],
      useUniqueFileName: true,
    });

    return {
      fileId: result.fileId,
      url: result.url,
      filePath: result.filePath,
      thumbnailUrl: result.thumbnailUrl,
      name: result.name,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
