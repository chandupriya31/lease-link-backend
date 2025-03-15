import { Schema, model } from 'mongoose';

const paymentSchema = new Schema({
    type: {
        type: String,
        enum: ['Credit', 'Debit'],
        default: 'Debit'
    },
    transaction_id: String,
    amount: Number,
    status: {
        type: String,
        default: "pending"
    },
    order_id: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
}, { timestamps: true });

export const Payment = model('Payment', paymentSchema);