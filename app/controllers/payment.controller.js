import Stripe from 'stripe';
import { BankDetails } from '../models/bank-details.model.js';
import { Payment } from '../models/payment.model.js';
import { Order } from '../models/order.model.js';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentSession = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Find order
        const order = await Order.findById(orderId).populate('product').populate('billing');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'completed') {
            return res.status(400).json({ message: 'Payment already completed' });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: order.product.name,
                        },
                        unit_amount: order.amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment-success?orderId=${orderId}&sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
        });

        // Create payment record with "pending" status
        const payment = new Payment({
            transaction_id: session.id,
            amount: order.amount,
            status: 'pending',
            customer: order.userId,
        });
        await payment.save();

        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating payment session:', error);
        res.status(500).json({ message: 'Failed to create payment session' });
    }
};

export const handlePaymentSuccess = async (req, res) => {
    try {
        const { orderId, sessionId } = req.body;

        if (!orderId || !sessionId) {
            return res.status(400).json({ message: 'Order ID and Session ID are required' });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        const existingPayment = await Payment.findOne({ transaction_id: session.payment_intent });
        if (existingPayment) {
            return res.status(400).json({ message: 'Payment already processed' });
        }

        const payment = new Payment({
            type: session.payment_method_types.includes('card') ? 'Credit' : 'Debit',
            transaction_id: session.payment_intent,
            amount: session.amount_total / 100,
            status: 'successful',
            customer: req.body.userId,
            order_id: orderId,
        });
        await payment.save();

        const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            transaction_id: payment.transaction_id,
            status: 'completed',
        }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Payment successful', order: updatedOrder, payment });
    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).json({ message: 'Failed to process payment success' });
    }
};

export const processPayout = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        const order = await Order.findById(orderId).populate('product');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.payoutStatus === 'completed') {
            return res.status(400).json({ message: 'Payout already processed' });
        }

        const payment = await Payment.findOne({ transaction_id: order.transaction_id });
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        const lenderId = new mongoose.Types.ObjectId(order.lender);
        const lenderBank = await BankDetails.findOne({ userId: lenderId });

        if (!lenderBank || !lenderBank.stripeAccountId) {
            return res.status(404).json({ message: 'Lender bank details not found' });
        }

        const account = await stripe.accounts.retrieve(lenderBank.stripeAccountId);
        if (account.capabilities.transfers !== 'active') {
            return res.status(400).json({ message: 'Lender account is not enabled for transfers' });
        }

        const totalAmount = payment.amount;
        const commission = totalAmount * 0.05;
        const payoutAmount = totalAmount - commission;

        console.log(`Total Amount: ₹${totalAmount}`);
        console.log(`Commission (5%): ₹${commission}`);
        console.log(`Payout Amount: ₹${payoutAmount}`);

        const transfer = await stripe.transfers.create({
            amount: Math.round(payoutAmount * 100),
            currency: 'inr',
            destination: lenderBank.stripeAccountId,
            description: `Payout for Order #${order._id}`,
        });

        order.payoutStatus = 'completed';
        await order.save();

        lenderBank.wallet += payoutAmount;
        await lenderBank.save();

        console.log(`Payout successful: ₹${payoutAmount}`);

        res.status(200).json({
            message: 'Payout successful',
            payoutAmount,
            transferId: transfer.id,
        });
    } catch (error) {
        console.error('Error processing payout:', error);

        // ✅ Improved error handling for Stripe-specific errors
        if (error.type === 'StripeInvalidRequestError') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'Failed to process payout', error: error.message });
    }
};


export const getStripeAccountDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const bankDetails = await BankDetails.findOne({ userId });
        if (!bankDetails || !bankDetails.stripeAccountId) {
            return res.status(404).json({ message: 'Stripe account not connected' });
        }

        const account = await stripe.accounts.retrieve(bankDetails.stripeAccountId);

        res.status(200).json({ account });
    } catch (error) {
        console.error('Error retrieving Stripe account details:', error);
        res.status(500).json({ message: 'Failed to retrieve Stripe account details' });
    }
};
