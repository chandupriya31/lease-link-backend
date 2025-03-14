import express from "express"
import { checkSchema } from "express-validator"
import { getAllFAQS, getFAQById, createFAQ, editFAQ, deleteFAQ } from "../app/controllers/faq_controller.js"
import faqValidator from "../app/validators/faq_validation.js";
import { authenticateUser, isAuthorizedUser } from '../app/middlewares/auth_middlewares.js';

const router = express.Router()
router.post("/",authenticateUser, isAuthorizedUser, checkSchema(faqValidator), createFAQ)
router.get("/", getAllFAQS)
router.get("/:id", getFAQById)
router.put("/:id",authenticateUser, isAuthorizedUser, editFAQ)
router.delete("/:id",authenticateUser, isAuthorizedUser, deleteFAQ)
export default router;
