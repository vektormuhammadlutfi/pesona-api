import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

/**
 * Generate realistic phone product data
 */
function generatePhoneProduct(categories: { id: string }[]) {
  const brands = [
    "Apple",
    "Samsung",
    "Google",
    "OnePlus",
    "Xiaomi",
    "Huawei",
    "Sony",
    "Motorola",
    "Nokia",
    "Oppo",
  ];
  const conditions = ["New", "Refurbished", "Used"];
  const storageOptions = [64, 128, 256, 512];

  const brand = faker.helpers.arrayElement(brands);
  const model = faker.lorem.word(); // Use a word as a stand-in for model name
  const condition = faker.helpers.arrayElement(conditions);
  const storage = faker.helpers.arrayElement(storageOptions);

  return {
    name: `${brand} ${model} ${storage}GB ${condition}`,
    slug: faker.helpers.slugify(
      `${brand}-${model}-${storage}-${condition}`.toLowerCase(),
    ),
    sku: `PHONE-${brand.slice(0, 3).toUpperCase()}-${faker.string.alphanumeric(5)}`,
    description: `${condition} ${brand} ${model} with ${storage}GB storage. 
      Condition: ${condition}. 
      Features: ${faker.lorem.sentence()}
      Color: ${faker.color.human()}
      Comes with original accessories.`,
    price: parseFloat(
      faker.commerce.price({
        min: condition === "New" ? 500 : 100,
        max: condition === "New" ? 1500 : 500,
        dec: 2,
      }),
    ),
    imageUrl: faker.image.urlLoremFlickr({
      category: "technics",
      width: 640,
      height: 480,
    }),
    stockQuantity: faker.number.int({ min: 0, max: 20 }),
    categoryId: faker.helpers.arrayElement(categories).id,
  };
}

async function main() {
  // Predefined categories with upsert to avoid duplicate key errors
  const categoryData = [
    {
      name: "Smartphones",
      description: "Latest and used smartphones",
    },
    {
      name: "Feature Phones",
      description: "Basic mobile phones",
    },
    {
      name: "Refurbished",
      description: "Professionally restored phones",
    },
  ];

  // Upsert categories
  const categories = await Promise.all(
    categoryData.map((category) =>
      prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      }),
    ),
  );

  // Clear existing products to prevent duplicate entries
  await prisma.product.deleteMany();

  // Generate 10 detailed phone products
  const products = Array.from({ length: 10 }).map(() => {
    const product = generatePhoneProduct(categories);
    return {
      ...product,
      variants: {
        create: [
          {
            name: "Storage",
            value: `${faker.helpers.arrayElement([64, 128, 256, 512])}GB`,
          },
          {
            name: "Color",
            value: faker.color.human(),
          },
        ],
      },
    };
  });

  // Create products with variants
  await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: product,
      }),
    ),
  );

  console.log("Seed data created successfully!");
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default main;
