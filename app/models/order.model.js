import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
    renter: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    lender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    status: {
        type: String,
        default: 'pending'
    },
    billing: {
        type: Schema.Types.ObjectId,
        ref: 'Billing'
    },
    transaction_id: {
        type: String,
        ref: 'Payment'
    },
    amount: Number,
    payout: {
        type: String,
        default: 'pending'
    }
}, { timestamps: true });

export const Order = model('Order', orderSchema);