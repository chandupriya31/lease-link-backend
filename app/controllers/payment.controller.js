import Stripe from 'stripe';
import { BankDetails } from '../models/bank-details.model.js';
import { Payment } from '../models/payment.model.js';
import { Order } from '../models/order.model.js';
import mongoose from 'mongoose';
import Cart from '../models/cart.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentSession = async (req, res) => {
    console.log(req.body);
    try {
        const { cartId } = req.body;

        if (!cartId) {
            return res.status(400).json({ message: 'Cart ID is required' });
        }

        const cart_id = new mongoose.Types.ObjectId(cartId)
        // Find the order by cartId and populate relevant fields
        const order = await Order.findOne({ cartId: cart_id })
            .populate('product')
            .populate('billing');

        // Log the order to check if it's null
        console.log('Order found:', order);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the order status is already 'completed'
        if (order.status === 'completed') {
            return res.status(400).json({ message: 'Payment already completed' });
        }

        // Create a Stripe session for payment
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
            success_url: `${process.env.CLIENT_URL}/success?cartId=${cartId}&sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });

        // Create a new payment record with the session ID and other details
        const payment = new Payment({
            transaction_id: session.id,
            amount: order.amount,
            status: 'pending',
            customer: order.renter,
            cartId,
        });

        await payment.save();

        // Send back the session ID and payment URL
        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating payment session:', error);
        res.status(500).json({ message: 'Failed to create payment session' });
    }
};

export const handlePaymentSuccess = async (req, res) => {
    try {
        const { cartId, sessionId, userId } = req.body;

        // Check if cartId and sessionId are provided
        if (!cartId || !sessionId) {
            return res.status(400).json({ message: 'Cart ID and Session ID are required' });
        }

        // Cast cartId, sessionId, and userId to ObjectId types
        const cartObjectId = mongoose.Types.ObjectId(cartId);
        const userObjectId = mongoose.Types.ObjectId(userId);

        // Retrieve the session from Stripe API
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if the payment is completed
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Check if the payment has already been processed
        const existingPayment = await Payment.findOne({ transaction_id: session.payment_intent });
        if (existingPayment) {
            return res.status(400).json({ message: 'Payment already processed' });
        }

        // Find the order based on the cartId
        const order = await Order.findOne({ cartId: cartObjectId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Create a new payment record
        const payment = new Payment({
            type: session.payment_method_types.includes('card') ? 'Credit' : 'Debit',
            transaction_id: session.payment_intent,
            amount: session.amount_total / 100,  // Convert amount from cents to dollars
            status: 'successful',
            customer: userObjectId,
            cartId: cartObjectId,
        });

        // Save the payment record
        await payment.save();

        // Update the order status to 'completed'
        const updatedOrder = await Order.findOneAndUpdate(
            { cartId: cartObjectId },
            {
                transaction_id: payment.transaction_id,
                status: 'completed',
            },
            { new: true }
        );

        // Update the cart to mark payment as 'completed'
        await Cart.findByIdAndUpdate({ _id: cartObjectId }, { payment: 'completed' }, { new: true });

        // If the order is not found or not updated
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Return the success response
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
