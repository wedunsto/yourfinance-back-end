import { Router } from "express";
import {
  createCategories,
  createCategory,
  readCategories,
  removeCategory,
  updateCategory,
} from "../controllers/categories.controller";

export const categoryRouter = Router();

categoryRouter.post("/", createCategory);
categoryRouter.post("/multiple", createCategories);
categoryRouter.get("/", readCategories);
categoryRouter.put("/:category_id", updateCategory);
categoryRouter.delete("/:category_id", removeCategory);
