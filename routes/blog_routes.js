import express from "express"
import { getAllBlogs, getBlogById, createBlog, editBlog, deleteBlog } from "../app/controllers/blog_controller.js"
import blogValidator from "../app/validators/blog_validation.js"
import { authenticateUser, isAuthorizedUser } from '../app/middlewares/auth_middlewares.js';
import { checkSchema } from "express-validator"

const router = express.Router()
router.post("/add-blog", authenticateUser, isAuthorizedUser, checkSchema(blogValidator), createBlog)
router.get("/:id", getBlogById)
router.get("/blogs", getAllBlogs)
router.put("/:id", authenticateUser, isAuthorizedUser, checkSchema(blogValidator), editBlog)
router.delete("/:id", deleteBlog)
export default router