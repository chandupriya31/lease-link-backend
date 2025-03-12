import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "../app/controllers/category.controller.js";
import {
  authenticateUser,
  isAuthorizedUser,
} from "../app/middlewares/auth_middlewares.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.post("/", createCategory);
router.put("/:id", updateCategory);

// Delete route
router.delete("/:id", deleteCategory);

export default router;
