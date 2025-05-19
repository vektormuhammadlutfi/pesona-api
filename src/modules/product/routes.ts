import { Hono } from "hono";
import * as productController from "./controller";

const productRoutes = new Hono();

productRoutes
  .get("/", productController.listProducts)
  .get("/:slug", productController.getProductBySlug);

export default productRoutes;
