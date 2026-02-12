import * as bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import minimist from "minimist";
import { Prisma, PrismaClient } from "src/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const roles: Prisma.RoleCreateInput[] = [
  {
    name: "Super Admin",
    description: "Full system access with all permissions",
  },
  {
    name: "Admin",
    description: "Admin-level access with limited permissions",
  },
  {
    name: "User",
    description: "Member-level access with limited permissions",
  },
];

const categories: Prisma.CategoryCreateInput[] = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and gadgets",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothing and accessories",
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    description: "Home and garden products",
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Sports equipment and outdoor gear",
  },
  {
    name: "Books & Media",
    slug: "books-media",
    description: "Books, music, and movies",
  },
];

const products = [
  {
    name: "Wireless Headphones",
    slug: "wireless-headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 299.99,
    stock: 15,
    image_url: "https://via.placeholder.com/300x300?text=Wireless+Headphones",
    category: "electronics",
  },
  {
    name: "Smart Watch",
    slug: "smart-watch",
    description: "Advanced smartwatch with health tracking features",
    price: 199.99,
    stock: 8,
    image_url: "https://via.placeholder.com/300x300?text=Smart+Watch",
    category: "electronics",
  },
  {
    name: "Laptop Stand",
    slug: "laptop-stand",
    description: "Adjustable aluminum laptop stand for better ergonomics",
    price: 49.99,
    stock: 25,
    image_url: "https://via.placeholder.com/300x300?text=Laptop+Stand",
    category: "electronics",
  },
  {
    name: "USB-C Cable",
    slug: "usb-c-cable",
    description: "Durable USB-C charging and data transfer cable",
    price: 12.99,
    stock: 0,
    image_url: "https://via.placeholder.com/300x300?text=USB-C+Cable",
    category: "electronics",
  },
  {
    name: "Premium Cotton T-Shirt",
    slug: "premium-cotton-tshirt",
    description: "Comfortable 100% cotton t-shirt available in multiple colors",
    price: 29.99,
    stock: 50,
    image_url: "https://via.placeholder.com/300x300?text=Cotton+T-Shirt",
    category: "fashion",
  },
  {
    name: "Leather Wallet",
    slug: "leather-wallet",
    description: "Genuine leather RFID-blocking wallet",
    price: 79.99,
    stock: 12,
    image_url: "https://via.placeholder.com/300x300?text=Leather+Wallet",
    category: "fashion",
  },
  {
    name: "Running Shoes",
    slug: "running-shoes",
    description: "Lightweight and comfortable running shoes",
    price: 119.99,
    stock: 20,
    image_url: "https://via.placeholder.com/300x300?text=Running+Shoes",
    category: "fashion",
  },
  {
    name: "Yoga Mat",
    slug: "yoga-mat",
    description: "Non-slip yoga mat with carrying strap",
    price: 34.99,
    stock: 30,
    image_url: "https://via.placeholder.com/300x300?text=Yoga+Mat",
    category: "sports-outdoors",
  },
  {
    name: "Dumbbells Set",
    slug: "dumbbells-set",
    description: "10kg adjustable dumbbells set with stand",
    price: 89.99,
    stock: 5,
    image_url: "https://via.placeholder.com/300x300?text=Dumbbells+Set",
    category: "sports-outdoors",
  },
  {
    name: "Water Bottle",
    slug: "water-bottle",
    description: "Insulated stainless steel water bottle 1L",
    price: 24.99,
    stock: 40,
    image_url: "https://via.placeholder.com/300x300?text=Water+Bottle",
    category: "sports-outdoors",
  },
];

async function seedRoles() {
  const roleCreateData = roles.map((r) => ({
    name: r.name,
    description: r.description,
  }));
  await prisma.role.createMany({
    data: roleCreateData,
    skipDuplicates: true,
  });
}

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
}

async function seedProducts() {
  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { slug: product.category },
    });

    if (category) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price.toString(),
          stock: product.stock,
          image_url: product.image_url,
          category_id: category.id,
        },
      });
    }
  }
}

async function seedSuperAdminUser() {
  const superAdminRole = await prisma.role.findFirst({
    where: {
      name: "Super Admin",
    },
  });

  await prisma.user.upsert({
    where: { username: "root" },
    update: {},
    create: {
      username: "root",
      password: await bcrypt.hash("password", 10),
      role: {
        connect: {
          id: superAdminRole?.id,
        },
      },
    },
  });
}

async function main() {
  const args = minimist(process.argv.slice(2));

  const runAll = args.all || Object.keys(args).length === 1;
  if (runAll || args.role) await seedRoles();
  if (runAll || args.user) await seedSuperAdminUser();
  if (runAll || args.category) await seedCategories();
  if (runAll || args.product) await seedProducts();
}

main()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
