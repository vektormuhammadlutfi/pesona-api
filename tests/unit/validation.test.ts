import { describe, expect, it } from "bun:test";
import { ProductSchema, CategorySchema } from "../../src/utils/validation";

describe("Validation Schemas", () => {
  describe("ProductSchema", () => {
    it("should accept valid product data", () => {
      const validProduct = {
        name: "iPhone 13 Pro 128GB",
        slug: "iphone-13-pro-128gb",
        sku: "IPH13P-128",
        description: "Kondisi mulus 95%, fullset original dengan garansi aktif.",
        price: 8500000,
        stockQuantity: 3,
        variants: [
          { name: "Warna", value: "Sierra Blue" },
          { name: "Penyimpanan", value: "128GB" },
        ],
      };

      const result = ProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("iPhone 13 Pro 128GB");
        expect(result.data.variants?.length).toBe(2);
      }
    });

    it("should reject negative prices", () => {
      const invalidProduct = {
        name: "iPhone 13",
        slug: "iphone-13",
        sku: "IPH13",
        description: "Kondisi seken mulus terawat.",
        price: -50000,
      };

      const result = ProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it("should reject invalid slug formats", () => {
      const invalidProduct = {
        name: "iPhone 13",
        slug: "iPhone 13 Invalid Slug!",
        sku: "IPH13",
        description: "Kondisi seken mulus terawat.",
        price: 7000000,
      };

      const result = ProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it("should reject short descriptions", () => {
      const invalidProduct = {
        name: "iPhone 13",
        slug: "iphone-13",
        sku: "IPH13",
        description: "Short",
        price: 7000000,
      };

      const result = ProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });
  });

  describe("CategorySchema", () => {
    it("should accept valid category data", () => {
      const validCategory = {
        name: "Smartphone Android",
        description: "Berbagai merk hp android bekas berkualitas",
      };

      const result = CategorySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });

    it("should reject short category names", () => {
      const invalidCategory = {
        name: "A",
      };

      const result = CategorySchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
    });
  });
});
