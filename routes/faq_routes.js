import express from "express"
import { checkSchema } from "express-validator"
import { getAllFAQS, getFAQById, createFAQ, editFAQ, deleteFAQ } from "../app/controllers/faq_controller.js"
import faqValidator from "../app/validators/faq_validation.js";
import { authenticateUser, isAuthorizedUser } from '../app/middlewares/auth_middlewares.js';

const router = express.Router()
router.post("/faq", checkSchema(faqValidator), createFAQ)
router.get("/faqs", getAllFAQS)
router.get("/:id", getFAQById)
router.put("/:id", editFAQ)
router.delete("/:id", deleteFAQ)
export default router;
