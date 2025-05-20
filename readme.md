# PESONA (Portal Elektronik Seken Online Nasabah) Marketplace API Documentation

## Getting Started

To set up the project locally, follow these steps:

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Run database migrations
bun run db:migrate

# Seed the database
bun run db:seed

# Start the development server
bun run dev

# (Optional) Start services with Docker Compose
docker compose up -d
```

## Product Module

### Overview

The Product module provides comprehensive for phone products with advanced filtering and search capabilities.

### tRPC Product API Requests

#### Health Check

```http
GET http://localhost:3000/trpc/healthCheck
```

#### List Products (Query) - Full Filtering

```http
GET http://localhost:3000/trpc/product.list?input={"page":1,"limit":10,"search":"","minPrice":0,"maxPrice":2000}
Content-Type: application/json
```

#### List Products (Query) - Default Parameters

```http
GET http://localhost:3000/trpc/product.list
Content-Type: application/json
```

#### Get Product by Slug (Query)

```http
GET http://localhost:3000/trpc/product.getBySlug?input={"slug":"apple-iphone-12-pro"}
Content-Type: application/json
```

#### Product Aggregation (Query) - Default

```http
GET http://localhost:3000/trpc/product.aggregate
Content-Type: application/json
```

#### Product Aggregation (Query) - Custom

```http
GET http://localhost:3000/trpc/product.aggregate?input={"groupBy":"price","metric":"avgPrice"}
Content-Type: application/json
```

### Category API Requests

#### List Categories (Query)

```http
GET http://localhost:3000/trpc/category.list
```

#### Get Category by ID (Query)

```http
GET http://localhost:3000/trpc/category.getById?input={"id":"category-uuid"}
Content-Type: application/json
```

### Endpoints and Usage

#### 1. List Products

Retrieve a list of products with advanced filtering options.

```typescript
// Client-side example using tRPC hooks
const { data, isLoading } = trpc.product.list.useQuery({
  // Optional filtering parameters
  page: 1, // Pagination: current page
  limit: 10, // Pagination: items per page
  search: "iPhone", // Text search across name, description, SKU
  minPrice: 300, // Minimum price filter
  maxPrice: 800, // Maximum price filter
  categoryIds: ["category-id"], // Filter by category
  inStock: true, // Only show products in stock
  sortBy: "price", // Sort by field (name, price, createdAt)
  sortOrder: "asc", // Sort direction
});
```

#### 2. Get Product by Slug

Retrieve detailed information about a specific product.

```typescript
// Fetch a single product
const { data, isLoading } = trpc.product.getBySlug.useQuery({
  slug: "iphone-12-pro",
});
```

### Example: Using tRPC Client Hook in React

```typescript
import { trpc } from '../utils/trpc';

function ProductList() {
  // Use the tRPC client hook to fetch products with filtering
  const { data: products, isLoading, error } = trpc.product.list.useQuery({
    page: 1,
    limit: 10,
    search: "",
    minPrice: 0,
    maxPrice: 2000,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products: {error.message}</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```
