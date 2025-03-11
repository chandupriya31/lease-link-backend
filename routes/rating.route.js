import express from 'express';
import { createrating, getallratings, getRatingByProduct } from "../app/controllers/rating.controller.js";
import { authenticateUser, isAuthorizedUser } from "../app/middlewares/auth_middlewares.js";

const router = express.Router();


router.post('', createrating);
router.get('', getallratings);
router.get('/:product_id', getRatingByProduct);




export default router;
