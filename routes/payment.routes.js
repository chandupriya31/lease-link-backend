import express from 'express';

import { confirmPayment, createPaymentSession, refundPayment } from '../app/controllers/payment.controller.js';
import { authenticateUser } from '../app/middlewares/auth_middlewares.js';

const router = express.Router();

router.post('/create', authenticateUser, createPaymentSession);

router.post('/confirm-payment', authenticateUser, confirmPayment);

router.post('/refund', authenticateUser, refundPayment);

export default router;
