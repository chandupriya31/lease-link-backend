import { createBill, getAllData } from "../app/controllers/billing.controller.js";

import express from "express";

const router = express.Router();
router.post("/", createBill);
router.get("/:user_id", getAllData);

export default router;