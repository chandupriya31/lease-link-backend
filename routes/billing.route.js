import { createBill, getCartData, getRequestedOrders } from "../app/controllers/billing.controller.js";

import express from "express";

const router = express.Router();
router.post("/", createBill);
router.get("/:user_id", getCartData);
router.get('/myrented/:user_id', getRequestedOrders);

export default router;