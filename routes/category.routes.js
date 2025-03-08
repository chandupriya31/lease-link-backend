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

// Protected routes - require authentication (admin only)
router.post("/", createCategory);
router.put(
  "/:id",
  // authenticateUser,
  // isAuthorizedUser,

  updateCategory
);

// Delete route
router.delete(
  "/:id",
  // authenticateUser,
  // isAuthorizedUser,
  deleteCategory
);

// Admin only routes
// router.delete(
//   "/:id/permanent",
//   authenticateUser,
//   Roles,
//   permanentlyDeleteCategory
// );

export default router;
