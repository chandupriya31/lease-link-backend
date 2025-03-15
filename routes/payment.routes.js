import express from 'express';
import { createPaymentSession, getStripeAccountDetails, handlePaymentSuccess, processPayout } from '../app/controllers/payment.controller.js';

const router = express.Router();

// Create payment session
router.post('/create', createPaymentSession);

// Handle payment success
router.post('/payment-success', handlePaymentSuccess);

// Process payout
router.post('/process-payout', processPayout);

router.get('/stripe-account/:userId', getStripeAccountDetails);

export default router;
