import express from 'express';
import { addProduct, deleteProduct, getAllProducts, getIndividualProduct } from '../app/controllers/product_controller.js';
import { authenticateUser, isAuthorizedUser } from '../app/middlewares/auth_middlewares.js';

const router = express.Router();

router.put('/add', authenticateUser, isAuthorizedUser, addProduct);
router.get('/products', getAllProducts);
router.get('/:id', getIndividualProduct);
router.delete('/:id', authenticateUser, isAuthorizedUser, deleteProduct);

export default router;