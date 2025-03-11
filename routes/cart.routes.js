import express from 'express';
import { createCart } from '../app/controllers/cart_controller.js';

const router = express.Router();

router.post("", createCart);



export default router;