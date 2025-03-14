import { createBill, getCartData, getRequestedOrders, updateOrderAcceptance } from "../app/controllers/billing.controller.js";

import express from "express";

const router = express.Router();
router.post("/", createBill);
router.get("/:user_id", getCartData);
router.get('/myrented/:user_id', getRequestedOrders);
router.put('/:id', updateOrderAcceptance)

export default router;