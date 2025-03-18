import express from 'express';
import { createPaymentSession, getStripeAccountDetails, handlePaymentSuccess, processPayout } from '../app/controllers/payment.controller.js';

const router = express.Router();

router.post('/create', createPaymentSession);

router.post('/payment-success', handlePaymentSuccess);

router.post('/process-payout', processPayout);

router.get('/stripe-account/:userId', getStripeAccountDetails);

export default router;
