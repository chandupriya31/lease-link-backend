import express from "express"
import {checkSchema} from "express-validator"
import { getAllFAQS, createFAQ } from "../app/controllers/faq_controller.js"
import faqValidator from "../app/validators/faq_validation.js";
import { authenticateUser, isAuthorizedUser } from '../app/middlewares/auth_middlewares.js';
const router = express.Router()
router.get("/",getAllFAQS)
router.post("/create",authenticateUser,isAuthorizedUser,checkSchema(faqValidator) ,createFAQ)
export default router