import express from "express"
import {checkSchema} from "express-validator"
import { getAllFAQS, getFAQById, createFAQ , editFAQ, deleteFAQ} from "../app/controllers/faq_controller.js"
import faqValidator from "../app/validators/faq_validation.js";
import { authenticateUser, isAuthorizedUser } from '../app/middlewares/auth_middlewares.js';
const router = express.Router()
router.get("/",getAllFAQS)
router.get("/:id",getFAQById)
router.post("/create",checkSchema(faqValidator),createFAQ)
router.put("/edit-faq/:id",editFAQ)
router.delete("/delete-faq/:id",deleteFAQ)
export default router;
