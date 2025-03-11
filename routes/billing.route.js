import { createBill, getAllData } from "../app/controllers/billing.controller.js";
import { authenticateUser, isAuthorizedUser } from '../app/middlewares/auth_middlewares.js';
import express from "express";

const router = express.Router();
router.post("/",authenticateUser, createBill);
router.get("/:user_id",authenticateUser, getAllData);

export default router;