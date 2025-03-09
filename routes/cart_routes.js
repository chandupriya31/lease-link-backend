import express from 'express';
import { createCart } from '../app/controllers/cart_controller';

const router = express.Router();

router.post('/add-to-cart', createCart);

export default router;