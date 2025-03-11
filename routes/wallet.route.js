import express from "express";
import { updateWallet, walletAmount } from "../app/controllers/wallet.controller.js";

const router = express.Router();


router.get("/get/:userId", walletAmount);
router.put("/update/:userId", updateWallet);

export default router;