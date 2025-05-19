import { Hono } from "hono";
import * as categoryController from "./controller";

const categoryRoutes = new Hono();

categoryRoutes
  .get("/", categoryController.listCategories)
  .get("/:id", categoryController.getCategoryById);

export default categoryRoutes;
