import express from 'express';
import { createCart, updateCart, deleteCart, getCartbyuserid, getAllCartCountnyuserId } from '../app/controllers/cart_controller.js';
import { authenticateUser } from '../app/middlewares/auth_middlewares.js';
const router = express.Router();

router.post("", createCart);
router.get("/:userId", getCartbyuserid);
router.put("/:cartid", updateCart);
router.delete("/:cartId", deleteCart);
router.get("/count/:userId", getAllCartCountnyuserId);
export default router;