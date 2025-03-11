import express from 'express';
import multer from 'multer';
import { addProduct, deleteProduct, getAllProducts, getIndividualProduct } from '../app/controllers/product_controller.js';
import { authenticateUser, isAuthorizedUser } from '../app/middlewares/auth_middlewares.js';
import { checkSchema } from 'express-validator';
import { productSchema } from '../app/validators/product_validation.js';

const upload = multer();


const router = express.Router();

router.put('/add', upload.array('images'), checkSchema(productSchema), addProduct);
router.get('/products', getAllProducts);
router.get('/:id', getIndividualProduct);
router.delete('/:id', deleteProduct);

export default router;