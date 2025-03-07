import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,


} from "../app/controllers/category.controller.js";
import {
  authenticateUser,
  isAuthorizedUser,
} from "../app/middlewares/auth_middlewares.js";

const router = express.Router();

// Public routes
router.get("/categories", getAllCategories);
router.get("/:id", getCategoryById);

// Protected routes - require authentication (admin only)
router.post("/create", createCategory);
router.put("/:id", authenticateUser, isAuthorizedUser, updateCategory);


// Admin only routes
// router.delete(
//   "/:id/permanent",
//   authenticateUser,
//   Roles,
//   permanentlyDeleteCategory
// );

export default router;
