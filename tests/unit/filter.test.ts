import { describe, expect, it } from "bun:test";
import { buildProductFilter, ProductFilterSchema } from "../../src/utils/advanced-filter";

describe("Advanced Filter Builder", () => {
  it("should construct default filter with pagination and sort", () => {
    const parsed = ProductFilterSchema.parse({});
    const { where, orderBy } = buildProductFilter(parsed);

    expect(where).toEqual({});
    expect(orderBy).toEqual([{ createdAt: "desc" }]);
  });

  it("should construct text search filter across default fields", () => {
    const parsed = ProductFilterSchema.parse({ search: "galaxy" });
    const { where } = buildProductFilter(parsed);

    expect(where.OR).toBeDefined();
    expect(where.OR.length).toBe(2);
    expect(where.OR[0]).toEqual({ name: { contains: "galaxy", mode: "insensitive" } });
    expect(where.OR[1]).toEqual({ description: { contains: "galaxy", mode: "insensitive" } });
  });

  it("should construct price range and stock filtering", () => {
    const parsed = ProductFilterSchema.parse({
      minPrice: 1000000,
      maxPrice: 5000000,
      inStock: true,
      categoryIds: ["cat-1", "cat-2"],
    });

    const { where } = buildProductFilter(parsed);

    expect(where.price).toEqual({ gte: 1000000, lte: 5000000 });
    expect(where.stockQuantity).toEqual({ gt: 0 });
    expect(where.categoryId).toEqual({ in: ["cat-1", "cat-2"] });
  });
});
