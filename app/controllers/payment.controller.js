import Stripe from 'stripe';
import { Payment } from '../models/payment.model.js';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import Cart from '../models/cart.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentSession = async (req, res) => {
    const { cartId } = req.body;
    if (!cartId) {
        return res.status(400).json({ message: 'Cart ID and amount are required' });
    }
    const cart = await Cart.findById(cartId);
    const amount = cart.total_price;
    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: 'Product Rental'
                    },
                    unit_amount: amount * 100
                },
                quantity: 1
            }
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`
    });

    const payment = await Payment.create({
        type: 'Credit',
        transaction_id: session.id,
        amount,
        status: 'pending'
    });

    const order = await Order.create({
        renter: cart.userId,
        // lender: lenderId,
        product: cart.productId,
        billing: payment._id,
        transaction_id: session.id,
        status: 'pending'
    });

    res.json({ sessionId: session.id, url: session.url, order });
};


export const confirmPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        const payment = await Payment.findOneAndUpdate(
            { transaction_id: sessionId },
            { status: 'completed' },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        const order = await Order.findOneAndUpdate(
            { transaction_id: sessionId },
            { status: 'completed' }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const lenderBank = await BankDetails.findOne({ userId: order.lender });
        if (!lenderBank) {
            return res.status(404).json({ message: 'Lender bank details not found' });
        }

        const totalAmount = payment.amount;
        const commission = totalAmount * 0.05;
        const payoutAmount = totalAmount - commission;

        console.log(`Total Amount: ₹${totalAmount}`);
        console.log(`Commission (5%): ₹${commission}`);
        console.log(`Payout Amount: ₹${payoutAmount}`);

        // Create Stripe payout
        const payout = await stripe.transfers.create({
            amount: payoutAmount * 100,
            currency: 'inr',
            destination: lenderBank.accountNumber,
            description: `Payout for Order #${order._id}`,
        });

        console.log(`Payout successful: ₹${payoutAmount}`);

        lenderBank.wallet += payoutAmount;
        await lenderBank.save();

        console.log(`Lender wallet updated: ₹${payoutAmount}`);

        res.status(200).json({ message: 'Payment confirmed and payout sent', payoutAmount });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: 'Failed to confirm payment' });
    }
};

export const refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        const refund = await stripe.refunds.create({
            payment_intent: payment.transaction_id
        });

        payment.status = 'refunded';
        await payment.save();

        res.status(200).json({ message: 'Payment refunded successfully', refund });
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({ message: 'Failed to refund payment' });
    }
};

